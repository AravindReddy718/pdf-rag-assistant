import MessageBubble from "./MessageBubble"
import { useEffect, useRef } from "react"

function ChatWindow({
  messages,
  loading
}) {
    const bottomRef = useRef(null)

        useEffect(() => {

        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        })

        }, [messages])
  return (
    <div
      style={{
        backgroundColor:
          "#1e293b",

        borderRadius: "16px",

        padding: "20px",

        height: "500px",

        marginBottom: "20px",

        overflowY: "auto",
      }}
    >
      {messages.length === 0 && (
        <p
          style={{
            color: "#94a3b8",
          }}
        >
          Upload a PDF and
          start chatting...
        </p>
      )}

      {messages.map(
        (msg, index) => (
          <MessageBubble
            key={index}
            role={msg.role}
            content={
              msg.content
            }
          />
        )
      )}

      {loading && (
        <p
          style={{
            color: "#94a3b8",
          }}
        >
          Thinking...
        </p>
      )}
        <div ref={bottomRef} />
    </div>
  )
}

export default ChatWindow