import React from "react";

const BotpressChat = () => {
  return (
    <iframe
      title="Botpress Chatbot"
      src="https://cdn.botpress.cloud/webchat/v2.2/shareable.html?configUrl=https://files.bpcontent.cloud/2025/01/07/19/20250107194052-N9RXW55E.json"  // This is the Botpress chat URL
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "350px",
        height: "500px",
        border: "none",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    />
  );
};

export default BotpressChat;
