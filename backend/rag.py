from ollama import embeddings
import faiss
import numpy as np


def chunk_text(text):

    chunks = []

    paragraphs = text.split("\n")

    current_chunk = ""

    for para in paragraphs:

        if len(current_chunk) + len(para) < 500:

            current_chunk += para + "\n"

        else:

            chunks.append(
                current_chunk
            )

            current_chunk = para + "\n"

    if current_chunk:

        chunks.append(
            current_chunk
        )

    return chunks


def create_embeddings(chunks):

    chunk_embeddings = []

    for chunk in chunks:

        response = embeddings(
            model="nomic-embed-text",
            prompt=chunk
        )

        chunk_embeddings.append(
            response["embedding"]
        )

    return chunk_embeddings


def create_faiss_index(
    chunk_embeddings
):

    embeddings_array = np.array(
        chunk_embeddings,
        dtype=np.float32
    )

    faiss.normalize_L2(
        embeddings_array
    )

    index = faiss.IndexFlatIP(
        embeddings_array.shape[1]
    )

    index.add(
        embeddings_array
    )

    return index


def retrieve_documents(
    question,
    index,
    documents,
    k=3
):

    question_embedding = np.array(
        [
            embeddings(
                model="nomic-embed-text",
                prompt=question
            )["embedding"]
        ],
        dtype=np.float32
    )

    faiss.normalize_L2(
        question_embedding
    )

    distances, indices = index.search(
        question_embedding,
        k
    )

    retrieved_documents = [

        documents[i]

        for i in indices[0]

    ]

    return retrieved_documents