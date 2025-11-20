import React, { useState, useEffect } from "react";

let globalAlertSetter = null;

export function showGlobalAlert(message) {
  if (globalAlertSetter) {
    globalAlertSetter(message);
  }
}

export default function GlobalAlert() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    globalAlertSetter = (msg) => {
      setMessage(msg);
      setVisible(true);
    };

    return () => {
      globalAlertSetter = null;
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    const hideAlert = () => {
      setVisible(false);
      setTimeout(() => setMessage(""), 300);
    };

    const timerId = setTimeout(() => {
      window.addEventListener("mousedown", hideAlert);
      window.addEventListener("keydown", hideAlert);
      window.addEventListener("touchstart", hideAlert);
    }, 100);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener("mousedown", hideAlert);
      window.removeEventListener("keydown", hideAlert);
      window.removeEventListener("touchstart", hideAlert);
    };
  }, [visible]);

  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "70px", // ✅ Position below header (adjust this value based on your header height)
        left: 0,
        width: "100%",
        backgroundColor: "#ffffff",
        color: "#000",
        fontFamily: "'Montserrat', sans-serif",
        textAlign: "left",
        padding: "16px 50px",
        fontWeight: "400",
        fontSize: "14px",
        zIndex: 9999,
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
        border: "1px solid #d0d0d0",
        borderRadius: "24px",
        margin: "0 auto",
        maxWidth: "calc(100% - 100px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.3s ease-in-out",
        cursor: "pointer",
      }}
      onClick={() => {
        setVisible(false);
        setTimeout(() => setMessage(""), 300);
      }}
    >
      {message}
    </div>
  );
}