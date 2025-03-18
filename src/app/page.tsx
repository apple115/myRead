"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { SelectionList } from "@/components/SelectionList";
import { AIDialog } from "@/components/AIDialog";
import { AnnotationMenu } from "@/components/AnnotationMenu";
import { EpubMetaInfo } from "@/components/EpubMetaInfo";
import { EpubReaderContainer } from "@/components/EpubReaderContainer";
import { loadEpubData, loadEpubMetaData } from "@/utils/epub";
import { callAI } from "@/utils/ai";
import { BaseDirectory, open, readFile } from "@tauri-apps/plugin-fs";
import { type Rendition, type Contents, Book } from "epubjs";

type ITextSelection = {
  text: string | null;
  cfiRange: string;
};

export default function Home() {
  const [epubFile, setEpubFile] = useState<Uint8Array | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [epubMeta, setEpubMeta] = useState<{
    title: string;
    author: string;
    description?: string;
  } | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [selections, setSelections] = useState<ITextSelection[]>([]);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [selectedText, setSelectedText] = useState<string>("");
  const [isAIDialogOpen, setAIDialogOpen] = useState(false);
  const [isAILoading, setAILoading] = useState(false);
  const [aiResponse, setAIResponse] = useState("");
  // 使用已知的 epubId 进行测试
  const epubId =
    "4345964574e1dbb72dccfc7863417b9dc3126707f20c3274b954eda53728dbac";

  useEffect(() => {
    if (rendition) {
      function showHelloworld(cfiRange: string, contents: Contents) {
        if (rendition) {
          setSelections((list) =>
            list.concat({
              text: rendition.getRange(cfiRange).toString(),
              cfiRange,
            }),
          );
          rendition.annotations.highlight(
            cfiRange,
            {},
            (e: MouseEvent) => {
              const range = rendition.getRange(cfiRange);
              const rects = range.getClientRects();
              console.log("rects", e);
              // 获取阅读器容器的位置
              const readerContainer =
                document.querySelector(".epub-container")!;
              const rect = readerContainer.getBoundingClientRect();
              const selectedText = rendition.getRange(cfiRange).toString();
              setSelectedText(selectedText);
              setMenuPosition({
                x: rects[0].x + rect.x,
                y: rects[0].y + rect.y,
              });
              setShowMenu(true);
            },
            "my-class",
            {
              // 添加必要的样式保证元素可交互
              style: () => ({
                "pointer-events": "all", // 关键：允许鼠标事件
                cursor: "pointer",
                "background-color": "rgba(255,0,0,0.3)",
              }),
            },
          );
          const selection = contents.window.getSelection();
          selection?.removeAllRanges();
        }
      }
      rendition.on("selected", showHelloworld);
      return () => {
        console.log("Unbinding click event from rendition");
        rendition?.off("selected", showHelloworld);
      };
    }
  }, [setSelections, rendition]);

  useEffect(() => {
    const loadEpub = async () => {
      try {
        // 加载 EPUB 文件内容
        const filePath = `epub-data/${epubId}.epub`;
        const data = await readFile(filePath, {
          baseDir: BaseDirectory.AppData,
        });
        setEpubFile(data);
        // // 加载 EPUB 元数据
        const meta = await loadEpubMetaData(epubId);
        setEpubMeta(meta);
      } catch (error) {
        console.error("Failed to load EPUB:", error);
        alert("Failed to load EPUB file");
      }
    };
    loadEpub();
  }, [epubId]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">EPUB Reader</h1>
        <Link
          href="/books"
          className="text-blue-600 hover:text-blue-800"
        >
          查看所有书籍 →
        </Link>
      </div>
      <SelectionList
        selections={selections}
        rendition={rendition}
        onRemove={(cfiRange) => {
          rendition?.annotations.remove(cfiRange, "highlight");
          setSelections(
            selections.filter((item) => item.cfiRange !== cfiRange),
          );
        }}
      />
      {showMenu && (
        <AnnotationMenu
          position={menuPosition}
          onClose={() => setShowMenu(false)}
          onAskAI={async (text) => {
            console.log("Text received in parent component:", text);
            try {
              if (!text.trim()) {
                console.warn("Empty text received");
                alert("请先选择一些文本");
                return;
              }
              setAIDialogOpen(true);
              setAILoading(true);
              setAIResponse("");

              console.log("Sending to AI:", text);
              const response = await callAI(`请解释这段话的含义: ${text}`);
              console.log("AI response:", response);
              if (response != null){
                  setAIResponse(response);
              }
            } catch (error) {
              console.error("AI request failed:", error);
              setAIResponse("AI请求失败，请稍后再试");
            } finally {
              setAILoading(false);
            }
          }}
          selectedText={selectedText}
        />
      )}
      {epubMeta && (
        <div className="mt-4">
          <EpubMetaInfo meta={epubMeta} />
          {epubFile && (
            <EpubReaderContainer
              epubFile={epubFile}
              location={location}
              onLocationChange={(loc: string) => setLocation(loc)}
              onRenditionChange={(_rendition: Rendition) => {
                console.log("Received rendition instance:", _rendition);
                setRendition(_rendition);
              }}
            />
          )}
        </div>
      )}
      <AIDialog
        isOpen={isAIDialogOpen}
        isLoading={isAILoading}
        content={aiResponse}
        onClose={() => setAIDialogOpen(false)}
      />
    </div>
  );
}
