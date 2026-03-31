// src/components/SaveIndicator.tsx
// Drop this file into excalidraw-app/src/components/SaveIndicator.tsx
// Shows a small "Saved to SisiAdHub" message in the corner of the canvas

import { useEffect, useState } from "react";

interface SaveIndicatorProps {
  canvasName: string | null;
}

export function SaveIndicator({ canvasName }: SaveIndicatorProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fade out after 4 seconds on first load
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);

  if (!canvasName) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.75)",
        color: "#fff",
        padding: "6px 14px",
        borderRadius: 20,
        fontSize: 12,
        fontFamily: "monospace",
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s ease",
        zIndex: 9999,
        letterSpacing: "0.03em",
        backdropFilter: "blur(4px)",
      }}
    >
      {canvasName} — auto-saves to SisiAdHub
    </div>
  );
}
