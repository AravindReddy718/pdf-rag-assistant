from fastapi import FastAPI, UploadFile
from pydantic import BaseModel
from ollama import chat
from pypdf import PdfReader
from io import BytesIO
from fastapi.middleware.cors import CORSMiddleware
from rag import (
    chunk_text,
    create_embeddings,
    create_faiss_index,
    retrieve_chunks
)
class ChatRequest(BaseModel):

    message: str

pdf_text = ""
chunks = []
faiss_index = None

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

    global pdf_text
    global chunks
    global faiss_index

    contents = await file.read()

    reader = PdfReader(
        BytesIO(contents)
    )

    pdf_text = ""

    for page in reader.pages:

        text = page.extract_text()

        if text:

            pdf_text += text + "\n"

    chunks = chunk_text(pdf_text)
    chunk_embeddings = (
        create_embeddings(chunks)
    )
    faiss_index = create_faiss_index(
         chunk_embeddings
    )


    return {
        "pages": len(reader.pages),
        "characters": len(pdf_text),
        "chunks": len(chunks),
        "embeddings": len(chunk_embeddings),
        "vectors": faiss_index.ntotal
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

    retrieved_chunks = retrieve_chunks(
        request.message,
        faiss_index,
        chunks
    )

    context = "\n\n".join(
        retrieved_chunks
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
                "content": request.message
            }
        ]
    )

    return {
        "response":
        response.message.content
    }

@app.post("/retrieve")
def retrieve_test(
    request: ChatRequest
):

    retrieved_chunks = retrieve_chunks(
        request.message,
        faiss_index,
        chunks
    )

    return {
        "chunks": retrieved_chunks
    }

