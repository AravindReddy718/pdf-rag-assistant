PDF RAG Assistant

A Retrieval-Augmented Generation (RAG) chatbot backend built using FastAPI, FAISS, Ollama, and local embedding models.

Features

* Upload PDF documents through API endpoints
* Automatic PDF text extraction
* Paragraph-based document chunking
* Semantic embeddings using Nomic Embed Text
* Vector similarity search using FAISS
* Retrieval-Augmented Generation (RAG)
* Local LLM inference using Qwen 3 via Ollama
* Context-aware question answering from uploaded documents

Architecture

PDF Upload
↓
Text Extraction
↓
Chunking
↓
Embeddings (Nomic Embed Text)
↓
FAISS Vector Index
↓
Semantic Retrieval
↓
Qwen 3 (Ollama)
↓
Answer Generation

API Endpoints

POST /upload

Uploads a PDF document, extracts text, generates embeddings, and builds a FAISS index.

POST /chat

Accepts a user question, retrieves relevant document chunks, and generates an answer using Qwen 3.

POST /retrieve

Debug endpoint used to inspect retrieved chunks without invoking the LLM.

Tech Stack

* Python
* FastAPI
* Ollama
* Qwen 3
* Nomic Embed Text
* FAISS
* NumPy
* PyPDF

Project Structure

backend/
├── main.py
├── rag.py
└── requirements.txt

Future Improvements

* React Frontend
* Multi-document Support
* Persistent FAISS Storage
* Source Citations
* Chunk Overlap Retrieval
* Conversation Memory
* User Authentication

Status

Current Version: FastAPI RAG Backend ✅

Completed:

* PDF Upload
* Text Extraction
* Chunking
* Embeddings
* FAISS Retrieval
* RAG Pipeline
* FastAPI Backend

Next Milestone:

* React Frontend
