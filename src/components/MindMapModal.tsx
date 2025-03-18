"use client";
import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MindMapModalProps {
  content: string;
  onClose: () => void;
}

export function MindMapModal({ content, onClose }: MindMapModalProps) {
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });
    const renderDiagram = async () => {
      if (diagramRef.current) {
        const { svg } = await mermaid.render("mindmap", content);
        diagramRef.current.innerHTML = svg;
      }
    };
    renderDiagram();
  }, [content]);

  return (
    <div className="fixed inset-0 bg-opacity-10 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-3/4 m-auto">
        <div className="px-4 py-2 flex justify-between items-center">
          <h5 className="text-sm font-bold text-gray-900">思维导图</h5>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            ×
          </button>
        </div>
        <div ref={diagramRef}></div>
      </div>
    </div>
  );
}
