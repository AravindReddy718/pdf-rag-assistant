import streamlit as st
from ollama import chat, embeddings
from pypdf import PdfReader
import time
import math
import numpy as np
import faiss

st.set_page_config(
    page_title="RAG CHATBOT",
    page_icon="🤖",
    layout="wide"
)

st.title("🤖 RAG CHATBOT")

# Session State

if "chunks" not in st.session_state:
    st.session_state.chunks = []

if "chunk_embeddings" not in st.session_state:
    st.session_state.chunk_embeddings = []

if "current_file" not in st.session_state:
    st.session_state.current_file = None

if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "system",
            "content": "You are a RAG chatbot."
        }
    ]


# Cosine Similarity

def cosine_similarity(a, b):

    dot = sum(
        x * y
        for x, y in zip(a, b)
    )

    norm_a = math.sqrt(
        sum(x * x for x in a)
    )

    norm_b = math.sqrt(
        sum(x * x for x in b)
    )

    return dot / (norm_a * norm_b)


# PDF Upload

uploaded_file = st.file_uploader(
    "Upload PDF",
    type="pdf"
)

if uploaded_file:

    # New PDF uploaded

    if st.session_state.current_file != uploaded_file.name:

        st.session_state.current_file = uploaded_file.name

        st.session_state.chunks = []
        st.session_state.chunk_embeddings = []

        st.session_state.messages = [
            {
                "role": "system",
                "content": "You are a DSA tutor."
            }
        ]

    pdf_text = ""

    reader = PdfReader(uploaded_file)

    for page in reader.pages:

        text = page.extract_text()

        if text:
            pdf_text += text + "\n"

    chunks = []

    paragraphs = pdf_text.split("\n")

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

    st.session_state.chunks = chunks

    # Generate Embeddings Once

    if not st.session_state.chunk_embeddings:

        with st.spinner(
            "Creating embeddings..."
        ):

            chunk_embeddings = []

            for chunk in chunks:

                response = embeddings(
                    model="nomic-embed-text",
                    prompt=chunk
                )

                chunk_embeddings.append(
                    response["embedding"]
                )

            st.session_state.chunk_embeddings = (
                chunk_embeddings
            )

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

            st.session_state.faiss_index = index

    st.success(
        "PDF loaded successfully!"
    )


# Sidebar

with st.sidebar:

    st.title("Settings")

    st.write(
        "Chat Model: Qwen 3 4B"
    )

    st.write(
        "Embedding Model: nomic-embed-text"
    )

    st.write(
        f"Chunks: {len(st.session_state.chunks)}"
    )

    st.write(
        f"Cached Embeddings: {len(st.session_state.chunk_embeddings)}"
    )
    if "faiss_index" in st.session_state and st.session_state.faiss_index:
        st.write(
            f"FAISS Vectors: {st.session_state.faiss_index.ntotal}"
        )

    if st.button("Clear Chat"):

        st.session_state.messages = [
            {
                "role": "system",
                "content": "You are a DSA tutor."
            }
        ]

        st.rerun()


# Display Chat History

for message in st.session_state.messages:

    if message["role"] != "system":

        with st.chat_message(
            message["role"]
        ):

            st.write(
                message["content"]
            )


# Chat Input

prompt = st.chat_input(
    "Ask a question about the uploaded PDF..."
)

if prompt:

    st.session_state.messages.append(
        {
            "role": "user",
            "content": prompt
        }
    )

    with st.chat_message("user"):

        st.write(prompt)

    retrieved_chunks = []

    context = ""

    if (
        st.session_state.chunks
        and st.session_state.chunk_embeddings
    ):

        stop_words = {
            "what",
            "is",
            "his",
            "her",
            "the",
            "a",
            "an",
            "of",
            "does",
            "do",
            "did",
            "has",
            "have",
            "had"
        }

        query_words = [

            word

            for word in prompt.lower().split()

            if word not in stop_words

        ]

        query = " ".join(
            query_words
        )

        question_embedding = np.array(
            [embeddings(
                model="nomic-embed-text",
                prompt=query
            )["embedding"]],
            dtype=np.float32
        )

        faiss.normalize_L2(
            question_embedding
        )

        distances, indices = (
            st.session_state.faiss_index.search(
                question_embedding,
                3
            )
        )

        top_indices = indices[0]
       

        retrieved_chunks = [

            st.session_state.chunks[i]

            for i in top_indices

        ]

        context = "\n\n".join(
            retrieved_chunks
        )

    with st.spinner("Thinking..."):

        start = time.time()

        response = chat(
            model="qwen3:4b",
            messages=[
                {
                    "role": "system",
                    "content": f"""
Answer ONLY from the provided context.

If the answer is not present in the context, say:

"I could not find that information in the document."

Context:

{context}
"""
                }
            ] + st.session_state.messages
        )

        answer = response.message.content

        elapsed = (
            time.time() - start
        )

    st.session_state.messages.append(
        {
            "role": "assistant",
            "content": answer
        }
    )

    with st.chat_message(
        "assistant"
    ):

        st.write(answer)

        with st.expander(
            "Retrieved Chunks (Debug)",
            expanded=False
        ):

            for i, chunk in enumerate(
                retrieved_chunks
            ):

                st.write(
                    f"Chunk {i + 1}"
                )

                st.write(chunk)

                st.divider()

        st.caption(
            f"Response time: {elapsed:.2f}s"
        )