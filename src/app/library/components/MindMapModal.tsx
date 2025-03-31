"use client";
import { useEffect, useRef,useState } from "react";
import mermaid from "mermaid";

interface MindMapModalProps {
  content: string;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function MindMapModal({
  content,
  onClose,
  isLoading,
  error,
}: MindMapModalProps) {
  const diagramRef = useRef<HTMLDivElement>(null);

  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    if (content) {
      setIsRendering(true);
      mermaid.initialize({ startOnLoad: false });
      const renderDiagram = async () => {
        if (diagramRef.current) {
          try {
            const { svg } = await mermaid.render("mindmap", content);
            diagramRef.current.innerHTML = svg;
          } catch (error) {
            console.error("Failed to render mermaid diagram:", error);
            diagramRef.current.innerHTML = `<div class="text-red-500 p-4">无法渲染思维导图</div>`;
          } finally {
            setIsRendering(false);
          }
        }
      };
      renderDiagram();
    }
  }, [content]);

  return (
    <div
      className="fixed inset-0 bg-black/30 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-3/4 m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-2 flex justify-between items-center border-b">
          <h5 className="text-sm font-bold text-gray-900">思维导图</h5>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none text-2xl"
          >
            &times;
          </button>
        </div>

        {(isLoading || isRendering) && (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">正在生成思维导图...</span>
          </div>
        )}

        {error && (
          <div className="p-8 text-red-500 text-center">{error}</div>
        )}
        {!isLoading && !isRendering && !error && (
          <div ref={diagramRef} className="p-4 max-h-[80vh] overflow-auto"></div>
        )}
      </div>
    </div>
  );
}
