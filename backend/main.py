from fastapi import FastAPI, UploadFile
from pydantic import BaseModel
from ollama import chat
from pypdf import PdfReader
from io import BytesIO
from fastapi.middleware.cors import CORSMiddleware

import faiss
import numpy as np

from rag import (
    chunk_text,
    create_embeddings,
    create_faiss_index,
    retrieve_documents
)


class ChatRequest(BaseModel):
    message: str


documents = []
chunk_embeddings = []
faiss_index = None
uploaded_pdfs = set()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload")
async def upload_pdf(
    file: UploadFile
):

    global documents
    global chunk_embeddings
    global faiss_index
    global uploaded_pdfs

    if file.filename in uploaded_pdfs:

        return {
            "message":
            "PDF already uploaded",
            "pdfs":
            sorted(
                list(uploaded_pdfs)
            )
        }

    try:

        contents = await file.read()

        reader = PdfReader(
            BytesIO(contents)
        )

    except Exception:

        return {
            "error":
            "Invalid PDF file"
        }

    new_chunks = []

    for page_number, page in enumerate(
        reader.pages,
        start=1
    ):

        page_text = (
            page.extract_text()
        )

        if not page_text:
            continue

        page_chunks = chunk_text(
            page_text
        )

        for chunk in page_chunks:

            documents.append(
                {
                    "text": chunk,
                    "source":
                    file.filename,
                    "page":
                    page_number
                }
            )

            new_chunks.append(
                chunk
            )

    if len(new_chunks) == 0:

        return {
            "error":
            "No extractable text found in PDF"
        }

    new_embeddings = (
        create_embeddings(
            new_chunks
        )
    )

    if len(new_embeddings) == 0:

        return {
            "error":
            "Failed to generate embeddings"
        }

    chunk_embeddings.extend(
        new_embeddings
    )

    if faiss_index is None:

        faiss_index = (
            create_faiss_index(
                new_embeddings
            )
        )

    else:

        embeddings_array = np.array(
            new_embeddings,
            dtype=np.float32
        )

        faiss.normalize_L2(
            embeddings_array
        )

        faiss_index.add(
            embeddings_array
        )

    uploaded_pdfs.add(
        file.filename
    )

    return {
        "message":
        "Upload successful",

        "pdfs":
        sorted(
            list(uploaded_pdfs)
        ),

        "total_chunks":
        len(documents),

        "total_vectors":
        faiss_index.ntotal
    }


@app.post("/chat")
def chat_endpoint(
    request: ChatRequest
):

    if faiss_index is None:

        return {
            "response":
            "Please upload a PDF first."
        }

    retrieved_documents = (
        retrieve_documents(
            request.message,
            faiss_index,
            documents
        )
    )

    context = "\n\n".join(

        doc["text"]

        for doc in
        retrieved_documents

    )

    sources = {}

    for doc in retrieved_documents:

        pdf = doc["source"]

        page = doc["page"]

        if pdf not in sources:

            sources[pdf] = set()

        sources[pdf].add(
            page
        )

    formatted_sources = []

    for pdf, pages in sources.items():

        formatted_sources.append(
            {
                "pdf": pdf,
                "pages":
                sorted(
                    list(pages)
                )
            }
        )

    response = chat(
        model="qwen3:4b",
        messages=[
            {
                "role": "system",
                "content": f"""
Answer ONLY from the provided context.

If the answer is not present in the context, say:

'I could not find that information in the document.'

Context:

{context}
"""
            },
            {
                "role": "user",
                "content":
                request.message
            }
        ]
    )

    return {
        "response":
        response.message.content,

        "sources":
        formatted_sources
    }


@app.get("/pdfs")
def get_uploaded_pdfs():

    return {
        "pdfs":
        sorted(
            list(uploaded_pdfs)
        )
    }