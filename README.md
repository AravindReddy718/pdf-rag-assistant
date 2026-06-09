# PDF RAG Assistant

A local Retrieval-Augmented Generation (RAG) chatbot built using:

- Streamlit
- Ollama
- Qwen 3
- Nomic Embed Text
- FAISS
- PyPDF

## Features

- Upload PDF documents
- Automatic chunking and embedding generation
- Semantic search using FAISS
- Context-aware question answering
- Local LLM inference using Ollama
- Embedding caching for faster retrieval

## Architecture

PDF → Chunking → Embeddings → FAISS → Retrieval → Qwen → Answer

## Tech Stack

- Python
- Streamlit
- Ollama
- FAISS
- NumPy
- PyPDF

## Future Improvements

- FastAPI backend
- React frontend
- Multi-document support
- Source citations
- Persistent vector database
