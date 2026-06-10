import "./MessageBubble.css"

function MessageBubble({
  role,
  content,
  sources = []
}) {
  return (
    <div
      className={`message-row ${role}`}
    >
      <div
        className={`message-bubble ${role}`}
      >
        <div>
          {content}
        </div>

        {
          role === "assistant" &&
          sources.length > 0 && (
            <div
              style={{
                marginTop: "14px",
                paddingTop: "10px",
                borderTop:
                  "1px solid rgba(255,255,255,0.15)",
                fontSize: "14px"
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  marginBottom: "6px"
                }}
              >
                📄 Sources
              </div>

              {
                sources.map(
                  (
                    source,
                    index
                  ) => (
                    <div
                      key={index}
                      style={{
                        marginBottom:
                          "4px"
                      }}
                    >
                      {source.pdf}
                      {" "}
                      (
                      Pages{" "}
                      {source.pages.join(
                        ", "
                      )}
                      )
                    </div>
                  )
                )
              }
            </div>
          )
        }

      </div>
    </div>
  )
}

export default MessageBubble