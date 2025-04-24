"use client";
import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Dialog } from "radix-ui";
import { getAiFileID, askAIWithFile } from "@/utils/ai";
import { ArrowUp } from "lucide-react";
import { UncontrolledReactSVGPanZoom } from "react-svg-pan-zoom";

interface MindMapModalProps {
  bookId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MindMapModal({
  open,
  onOpenChange,
  bookId,
}: MindMapModalProps) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef(null); // 新增 viewerRef 用于引用 ReactSVGPanZoom 组件
  const [userInput, setUserInput] = useState<string>();
  const [svgContent, setSvgContent] = useState<string>("");
  const svgRef = useRef(null);

  //得到mermaid的语法块
  const extractMermaidCode = async (text: string): Promise<string> => {
    const regex = /```mermaid[\s\S]*?```/i;
    const match = text.match(regex);
    if (!match) {
      throw new Error("未找到有效的Mermaid代码块");
    }
    return match[0].replace(/^```mermaid\s*/, "").replace(/\s*```$/, "");
  };

  const generateMindMap = async (bookId: string): Promise<void> => {
    console.log("generateMindMap", bookId);
    try {
      const aiFileId = await getAiFileID(bookId);
      if (aiFileId != null) {
        const question = `请根据这本书的内容生成 mermaid 语法的中文思维导图,直接可以使用的语法不需要其他文字，生成的思维导图不可以太大,和用户希望的思维导图如下${userInput}`;
        const response = await askAIWithFile(aiFileId, [], question);
        if (!response?.content) {
          throw new Error("AI没有返回有效的内容");
        }
        console.log("回答", response.content);
        const mermaidText = await extractMermaidCode(response.content);
        console.log("mermaidText", mermaidText);
        mermaid.initialize({ startOnLoad: false });
        if (diagramRef.current) {
          try {
            const { svg } = await mermaid.render("mindmap", mermaidText);
            console.log("图片为", svg);
            diagramRef.current.innerHTML = svg;

            setSvgContent(svg);
          } catch (error) {
            console.error("Failed to render mermaid diagram:", error);
            diagramRef.current.innerHTML =
              '<div class="text-red-500 p-4">无法渲染思维导图</div>';
            setSvgContent(
              '<div class="text-red-500 p-4">无法渲染思维导图</div>',
            );
          }
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50">
          <Dialog.Content className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-3/4 m-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Dialog.Title className="text-sm font-bold text-gray-900">
              思维导图
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-500 focus:outline-none text-2xl">
              &times;
            </Dialog.Close>
            <div className="flex justify-between items-center ">
              <input
                className="w-full"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <button
                onClick={() => {
                  generateMindMap(bookId);
                }}
              >
                <ArrowUp size={16} className="" />
              </button>
            </div>
            思维导图为：
            <div className="p-4 max-h-[80vh] overflow-auto">
              <div ref={diagramRef} />
              {/* FIX: 这个目前是实现不来了
              <UncontrolledReactSVGPanZoom
                ref={viewerRef}
                width={600} // 设置宽度
                height={400} // 设置高度
                onZoom={(e) => console.log("zoom")}
                onPan={(e) => console.log("pan")}
                ></UncontrolledReactSVGPanZoom> */}
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
