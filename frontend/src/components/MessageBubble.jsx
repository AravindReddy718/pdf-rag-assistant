function MessageBubble({
  role,
  content
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          role === "user"
            ? "flex-end"
            : "flex-start",
      }}
    >
      <div
        style={{
          backgroundColor:
            role === "user"
              ? "#2563eb"
              : "#334155",

          padding: "12px 16px",

          borderRadius: "14px",

          margin: "8px 0",

          maxWidth: "75%",

          lineHeight: "1.6",

          color: "white",
        }}
      >
        {content}
      </div>
    </div>
  )
}

export default MessageBubble