import { useEffect, useRef, useCallback } from "react";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";

const API = "https://tools.tmtyl.studio/whiteboard-api";
const SAVE_DEBOUNCE_MS = 2000;

export interface CanvasData {
  id: string;
  name: string;
  project: string;
}

export function getCanvasIdFromUrl(): string | null {
  const hash = window.location.hash;
  const match = hash.match(/^#canvas-([a-f0-9-]{36})$/);
  return match ? match[1] : null;
}

export async function loadCanvasFromApi(id: string): Promise<{
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState>;
  files: BinaryFiles;
  meta: CanvasData;
} | null> {
  try {
    const res = await fetch(`${API}/canvases/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.data) return null;
    return {
      elements: json.data.elements || [],
      appState: json.data.appState || {},
      files: json.data.files || {},
      meta: { id: json.id, name: json.name, project: json.project },
    };
  } catch {
    return null;
  }
}

export function useCanvasSync(canvasId: string | null) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSaving = useRef(false);

  const saveCanvas = useCallback(
    async (
      elements: readonly ExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles,
    ) => {
      if (!canvasId || isSaving.current) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        isSaving.current = true;
        try {
          await fetch(`${API}/canvases/${canvasId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: {
                type: "excalidraw",
                version: 2,
                source: window.location.origin,
                elements,
                appState: {
                  viewBackgroundColor: appState.viewBackgroundColor,
                  gridSize: appState.gridSize,
                  currentItemFontFamily: appState.currentItemFontFamily,
                },
                files,
              },
            }),
          });
        } catch {
          console.warn("[SisiWhiteboard] Auto-save failed");
        } finally {
          isSaving.current = false;
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [canvasId],
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return { saveCanvas };
}
