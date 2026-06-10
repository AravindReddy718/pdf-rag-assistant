import {
  useState,
  useEffect
} from "react"

import {
  Upload,
  Send,
  FileText
} from "lucide-react"

import ChatWindow from "./components/ChatWindow"

import "./App.css"

function App() {

  const [message, setMessage] =
    useState("")

  const [messages, setMessages] =
    useState([])

  const [file, setFile] =
    useState(null)

  const [uploadStatus,
    setUploadStatus] =
    useState("")

  const [loading,
    setLoading] =
    useState(false)

  const [pdfs,
    setPdfs] =
    useState([])

  const [chats,
  setChats] =
  useState([])

  const [currentChat,
  setCurrentChat] =
  useState(null)  

  useEffect(() => {

  loadPdfs()

  loadChats()

}, [])
  async function loadPdfs() {

    try {

      const response =
        await fetch(
          "http://127.0.0.1:8000/pdfs"
        )

      const data =
        await response.json()

      setPdfs(
        data.pdfs || []
      )

    } catch {

      console.log(
        "Failed to load PDFs"
      )

    }

  }

  async function loadChats() {

  try {

    const response =
      await fetch(
        "http://127.0.0.1:8000/chats"
      )

    const data =
      await response.json()

    setChats(
      data.chats || []
    )

  } catch {

    console.log(
      "Failed to load chats"
    )

  }

}

async function loadChat(
  chatId
) {

  try {

    const response =
      await fetch(
        `http://127.0.0.1:8000/chat/${chatId}`
      )

    const data =
      await response.json()

    setMessages(
      data.history || []
    )

    setPdfs(
      data.pdfs || []
    )

  } catch {

    console.log(
      "Failed to load chat"
    )

  }

}

  async function createChat() {

  try {

    const response =
      await fetch(
        "http://127.0.0.1:8000/chat/new",
        {
          method: "POST"
        }
      )

    const data =
      await response.json()

    await loadChats()

    setCurrentChat(
      data.chat_id
    )
    setMessages([])

setPdfs([])

  } catch {

    console.log(
      "Failed to create chat"
    )

  }

}

  async function uploadPDF() {

    if (!currentChat) {

  setUploadStatus(
    "Please create or select a chat first."
  )

  return

}

    if (!file) return

    const formData =
      new FormData()

    formData.append(
      "file",
      file
    )

    try {

      const response =
        await fetch(
          `http://127.0.0.1:8000/upload/${currentChat}`,
          {
            method: "POST",
            body: formData
          }
        )

      const data =
        await response.json()

      setUploadStatus(
        data.message ||
        `${file.name} uploaded successfully`
      )

      await loadPdfs()

    } catch {

      setUploadStatus(
        "Upload failed"
      )

    }

  }

  async function sendMessage() {
    if (!currentChat) {

  setMessages(prev => [

    ...prev,

    {
      role:
      "assistant",

      content:
      "Please select a chat first."
    }

  ])

  return

}

    if (!message.trim())
      return

    const currentMessage =
      message

    setMessages(prev => [
      ...prev,
      {
        role: "user",
        content:
          currentMessage
      }
    ])

    setMessage("")
    setLoading(true)

    try {

      const response =
        await fetch(
          `http://127.0.0.1:8000/chat/${currentChat}`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              message:
                currentMessage
            })
          }
        )

      const data =
        await response.json()

      setMessages(prev => [
        ...prev,
        {
          role:
            "assistant",
          content:
            data.response,
          sources:
            data.sources || []
        }
      ])

    } catch {

      setMessages(prev => [
        ...prev,
        {
          role:
            "assistant",
          content:
            "Server error."
        }
      ])

    }

    setLoading(false)

  }

  return (

    <div className="app">

      <div className="container">

        <div className="layout">

          <div className="sidebar">

  <button
    className="upload-btn"
    onClick={createChat}
    style={{
      width: "100%",
      marginBottom: "20px"
    }}
  >
    ➕ New Chat
  </button>

  <h3>
    💬 Chats
  </h3>

  {
    chats.map(
      chat => (

        <div
          key={chat.id}

          onClick={() => {

            setCurrentChat(
              chat.id 
            )

            loadChat(
              chat.id
            )

          }}

          className="pdf-item"

          style={{
            background:
              currentChat === chat.id
                ? "#2563eb"
                : ""
          }}
        >

          💬 {chat.title}

        </div>

      )
    )
  }

  <hr
    style={{
      margin: "20px 0"
    }}
  />

  <h3>
    📚 PDFs
  </h3>

  {
    pdfs.length === 0
    ? (
      <p>
        No PDFs uploaded
      </p>
    )
    : (
      pdfs.map(
        (
          pdf,
          index
        ) => (

          <div
            key={index}
            className="pdf-item"
          >
            📄 {pdf}
          </div>

        )
      )
    )
  }

</div>

          <div className="main-content">

            <h1 className="title">
              🤖 PDF RAG Assistant
            </h1>
 

            <p className="subtitle">
              Chat with your PDFs
              using FAISS •
              Ollama • Qwen
            </p>

            <div className="upload-card">

              <div className="upload-row">

                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setFile(
                      e.target.files[0]
                    )
                  }
                />

                <button
                  className="upload-btn"
                  onClick={
                    uploadPDF
                  }
                >
                  <Upload size={18}/>
                  Upload
                </button>

              </div>

              {
                uploadStatus && (

                  <div
                    className="upload-status"
                  >

                    <FileText
                      size={18}
                    />

                    {uploadStatus}

                  </div>

                )
              }

            </div>

            <ChatWindow
              messages={
                messages
              }
              loading={
                loading
              }
            />

            <div className="input-row">

              <input
                className="chat-input"
                type="text"
                placeholder="Ask a question..."
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key ===
                    "Enter"
                  ) {

                    sendMessage()

                  }

                }}
              />

              <button
                className="send-btn"
                onClick={
                  sendMessage
                }
              >
                <Send size={18}/>
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  )

}

export default App