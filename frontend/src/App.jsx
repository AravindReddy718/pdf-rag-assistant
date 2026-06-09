import { useState } from "react"
import { Upload, Send, FileText } from "lucide-react"
import ChatWindow from "./components/ChatWindow"

function App() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [file, setFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState("")
  const [loading, setLoading] = useState(false)

  async function uploadPDF() {
    if (!file) return

    const formData = new FormData()

    formData.append("file", file)

    try {
      await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          body: formData,
        }
      )

      setUploadStatus(
        `${file.name} uploaded successfully`
      )
    } catch {
      setUploadStatus(
        "Upload failed"
      )
    }
  }

  async function sendMessage() {
    if (!message.trim()) return

    const currentMessage = message

    setMessages(prev => [
      ...prev,
      {
        role: "user",
        content: currentMessage,
      },
    ])

    setMessage("")
    setLoading(true)

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message: currentMessage,
          }),
        }
      )

      const data =
        await response.json()

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong.",
        },
      ])
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#0f172a,#111827)",
        color: "white",
        padding: "30px",
        fontFamily:
          "Inter, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "42px",
            marginBottom: "10px",
          }}
        >
          🤖 PDF RAG Assistant
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
            marginBottom: "30px",
          }}
        >
          Chat with your PDFs using
          FAISS • Ollama • Qwen
        </p>

        <div
          style={{
            backgroundColor:
              "#1e293b",
            borderRadius: "18px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
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
              onClick={uploadPDF}
              style={{
                backgroundColor:
                  "#2563eb",
                border: "none",
                color: "white",
                padding:
                  "10px 18px",
                borderRadius:
                  "10px",
                cursor: "pointer",
                display: "flex",
                gap: "8px",
                alignItems:
                  "center",
              }}
            >
              <Upload size={18} />
              Upload
            </button>
          </div>

          {uploadStatus && (
            <div
              style={{
                marginTop: "15px",
                color: "#22c55e",
                display: "flex",
                alignItems:
                  "center",
                gap: "8px",
              }}
            >
              <FileText
                size={18}
              />
              {uploadStatus}
            </div>
          )}
        </div>

        <ChatWindow
          messages={messages}
          loading={loading}
        />

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Ask a question about the uploaded PDF..."
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter"
              ) {
                sendMessage()
              }
            }}
            style={{
              flex: 1,
              padding: "16px",
              borderRadius:
                "14px",
              border:
                "1px solid #334155",
              backgroundColor:
                "#1e293b",
              color: "white",
              outline: "none",
            }}
          />

          <button
            onClick={
              sendMessage
            }
            disabled={loading}
            style={{
              backgroundColor:
                "#2563eb",
              border: "none",
              color: "white",
              width: "60px",
              borderRadius:
                "14px",
              cursor: "pointer",
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default App