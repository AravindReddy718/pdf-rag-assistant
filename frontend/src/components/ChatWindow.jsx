import "./ChatWindow.css"

import MessageBubble from "./MessageBubble"

import {
  useEffect,
  useRef
} from "react"

function ChatWindow({
  messages,
  loading
}) {

  const bottomRef =
    useRef(null)

  useEffect(() => {

    bottomRef.current
      ?.scrollIntoView({
        behavior: "smooth"
      })

  }, [messages])

  return (
    <div className="chat-window">

      {messages.length === 0 && (
        <p className="empty-state">
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
            sources={
              msg.sources || []
            }
          />

        )
      )}

      {loading && (
        <p className="loading">
          Thinking...
        </p>
      )}

      <div ref={bottomRef}></div>

    </div>
  )
}

export default ChatWindow