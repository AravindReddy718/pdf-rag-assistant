import { useState } from "react"
function App() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  async function sendMessage() {

  if (!message.trim()) {
    return
  }
  const userMessage = {
  role: "user",
  content: message
  }

  setMessages([
    ...messages,
    userMessage
  ])

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

  setMessage("")
  }
  return (
    <div>
      <h1>🤖 PDF RAG Assistant</h1>

      <hr />

      <button>
        Upload PDF
      </button>

      <hr />

      <div>
        <p>
          <strong>User:</strong>
          What is his CGPA?
        </p>

        <p>
          <strong>Bot:</strong>
          His B.Tech CGPA is 9.01/10.
        </p>
      </div>

      <hr />

      <input
        type="text"
        placeholder="Ask a question..."
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
      />
      {messages.map((msg, index) => (

        <p key={index}>
          <strong>
            {msg.role}:
          </strong>{" "}
          {msg.content}
        </p>

      ))}
          

      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  )
}

export default App