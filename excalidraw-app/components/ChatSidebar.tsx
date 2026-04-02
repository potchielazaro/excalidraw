import { Sidebar } from "@excalidraw/excalidraw";
import { useState, useEffect, useRef, useCallback } from "react";

const API = "https://tools.tmtyl.studio/whiteboard-api";
const USERNAME_KEY = "sisi_chat_username";

export const CHAT_SIDEBAR_NAME = "sisi-chat";

interface Message {
  id: string;
  username: string;
  text: string;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const ChatSidebar = ({ canvasId }: { canvasId: string | null }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_KEY) || "");
  const [settingName, setSettingName] = useState(false);
  const [nameInput, setNameInput] = useState(username);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(() => {
    if (!canvasId) return;
    fetch(`${API}/canvases/${canvasId}/messages`)
      .then((res) => { if (res.ok) return res.json(); })
      .then((data) => { if (data) setMessages(data); })
      .catch(() => {});
  }, [canvasId]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !canvasId || sending) return;
    if (!username) { setSettingName(true); return; }
    setSending(true);
    fetch(`${API}/canvases/${canvasId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input.trim(), username }),
    })
      .then((res) => { if (res.ok) return res.json(); })
      .then((msg) => {
        if (msg) {
          setMessages((prev) => [...prev, msg]);
          setInput("");
        }
      })
      .catch(() => {})
      .finally(() => setSending(false));
  };

  const saveName = () => {
    const name = nameInput.trim();
    if (!name) return;
    localStorage.setItem(USERNAME_KEY, name);
    setUsername(name);
    setSettingName(false);
  };

  return (
    <Sidebar name={CHAT_SIDEBAR_NAME} className="sisi-chat-sidebar">
      <Sidebar.Header>
        <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-on-surface)" }}>
            Canvas Chat
          </span>
          <button
            onClick={() => { setNameInput(username); setSettingName((s) => !s); }}
            title={username ? `Chatting as ${username}` : "Set your name"}
            style={{
              marginLeft: "auto", fontSize: 11, background: "none", border: "none",
              cursor: "pointer", color: "var(--color-primary)", padding: "2px 6px",
              borderRadius: 4, opacity: 0.8,
            }}
          >
            {username || "set name"}
          </button>
        </div>
      </Sidebar.Header>

      <div style={{ display: "flex", flexDirection: "column", height: "calc(100% - 50px)", overflow: "hidden" }}>

        {settingName && (
          <div style={{
            padding: "10px 12px", borderBottom: "1px solid var(--color-border-card)",
            background: "var(--island-bg-color)", display: "flex", flexDirection: "column", gap: 6,
          }}>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              {username ? "Change your name:" : "What should we call you?"}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setSettingName(false); }}
                placeholder="Your name"
                style={{
                  flex: 1, padding: "6px 10px", fontSize: 12, borderRadius: 6,
                  border: "1px solid var(--color-border-card)",
                  background: "var(--color-surface-low)", color: "var(--color-on-surface)",
                  outline: "none",
                }}
              />
              <button
                onClick={saveName}
                disabled={!nameInput.trim()}
                style={{
                  padding: "6px 12px", fontSize: 12, borderRadius: 6, border: "none",
                  background: nameInput.trim() ? "var(--color-primary)" : "var(--color-surface-lowest)",
                  color: nameInput.trim() ? "#fff" : "var(--color-text-muted)",
                  cursor: "pointer",
                }}
              >
                save
              </button>
            </div>
          </div>
        )}

        <div style={{
          flex: 1, overflowY: "auto", padding: "12px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {!canvasId && (
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", textAlign: "center", marginTop: 32, lineHeight: 1.6 }}>
              Open a canvas from the<br />dashboard to use chat.
            </div>
          )}
          {canvasId && messages.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", textAlign: "center", marginTop: 32, lineHeight: 1.6 }}>
              No messages yet.<br />Say something!
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-primary)" }}>
                  {msg.username}
                </span>
                <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
                  {timeAgo(msg.createdAt)}
                </span>
              </div>
              <div style={{
                fontSize: 13, color: "var(--color-on-surface)", lineHeight: 1.5,
                background: "var(--color-surface-low)", borderRadius: "4px 10px 10px 10px",
                padding: "6px 10px", wordBreak: "break-word",
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={{
          padding: "8px 10px",
          borderTop: "1px solid var(--color-border-card)",
          display: "flex", gap: 6, alignItems: "flex-end",
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder={
              !canvasId ? "Open a canvas first" :
              !username ? "Set your name to chat" :
              "Message… (Enter to send)"
            }
            disabled={!canvasId}
            rows={2}
            style={{
              flex: 1, padding: "8px 10px", fontSize: 13, borderRadius: 8,
              border: "1px solid var(--color-border-card)",
              background: "var(--color-surface-low)", color: "var(--color-on-surface)",
              resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.4,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !canvasId || sending}
            style={{
              padding: "8px 14px", fontSize: 12, borderRadius: 8, border: "none",
              background: input.trim() && canvasId && !sending
                ? "var(--color-primary)" : "var(--color-surface-lowest)",
              color: input.trim() && canvasId && !sending
                ? "#fff" : "var(--color-text-muted)",
              cursor: input.trim() && canvasId && !sending ? "pointer" : "default",
              transition: "background 0.15s",
              flexShrink: 0,
            }}
          >
            {sending ? "…" : "send"}
          </button>
        </div>
      </div>
    </Sidebar>
  );
};
