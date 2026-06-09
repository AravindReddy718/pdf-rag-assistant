import { useState } from "react"
function App() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [file, setFile] = useState(null)
  const [uploadStatus, setUploadStatus]= useState("")
  const [loading, setLoading] =useState(false)
  async function uploadPDF() {

  if (!file) {
    return
  }

  const formData = new FormData()

  formData.append(
    "file",
    file
  )

  const response = await fetch(
    "http://127.0.0.1:8000/upload",
    {
      method: "POST",
      body: formData
    }
  )

  const data =
    await response.json()

  setUploadStatus(
  "PDF uploaded successfully"
  )
  
}

  async function sendMessage() {

  if (!message.trim()) {
    return
  }
  const userMessage = {
  role: "user",
  content: message
  }

  setMessages(prev => [
  ...prev,
  userMessage
  ])
  setLoading(true)
  const response = await fetch(
  "http://127.0.0.1:8000/chat",
  {
    method: "POST",

    headers: {
      "Content-Type":
      "application/json"
    },

    body: JSON.stringify({
      message: message
    })
  }
  )
  const data = await response.json()
  setMessages(prev => [

  ...prev,

  {
    role: "assistant",
    content: data.response
  }

  ])

  setLoading(false)
  setMessage("")
  }
  return (
    <div>
      <h1>🤖 PDF RAG Assistant</h1>

      <hr />

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button
        onClick={uploadPDF}
      >
        Upload PDF
      </button>
      <p>{uploadStatus}</p>

      <hr />
     

      <hr />
      {
        loading &&
        <p>Thinking...</p>
      }
      <input
        type="text"
        placeholder="Ask a question..."
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
      />
      {messages.map((msg, index) => (

        <div
          key={index}
          style={{
            padding: "10px",
            margin: "10px",
            borderRadius: "10px",
            backgroundColor:
              msg.role === "user"
                ? "#2563eb"
                : "#1f2937",

            maxWidth: "70%",

            marginLeft:
              msg.role === "user"
                ? "auto"
                : "0",
          }}
        >
          {msg.content}
        </div>

      ))}
          

      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  )
}

export default App