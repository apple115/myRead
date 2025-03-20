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
import type { ITextSelection } from "@/types/annotation";

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
  const [selection, setSelection] = useState<ITextSelection | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isAIDialogOpen, setAIDialogOpen] = useState(false);
  const [isAILoading, setAILoading] = useState(false);
  const [aiResponse, setAIResponse] = useState("");
  // 使用已知的 epubId 进行测试
  const epubId =
    "4345964574e1dbb72dccfc7863417b9dc3126707f20c3274b954eda53728dbac";

  /**
   * 处理高亮区域的点击事件
   * @param cfiRange - 当前高亮区域的CFI标识
   * @param rendition - 当前阅读器实例
   */
  function handleHighlightClick(
    selection: ITextSelection,
    rendition: Rendition,
  ) {
    if (rendition) {
      // 获取高亮区域的DOM范围
      const range = rendition.getRange(selection.cfiRange);
      const rects = range.getClientRects();

      // 获取阅读器容器的位置信息
      const readerContainer = document.querySelector(".epub-container")!;
      const rect = readerContainer.getBoundingClientRect();

      setSelection(selection);

      // 计算并设置菜单显示位置
      setMenuPosition({
        x: rects[0].x + rect.x, // 水平位置 = 高亮区域x坐标 + 容器偏移量
        y: rects[0].y + rect.y, // 垂直位置 = 高亮区域y坐标 + 容器偏移量
      });
      setShowMenu(true);
    }
  }

  useEffect(() => {
    if (rendition) {
      /**
       * 处理文本选择事件
       * @param cfiRange - 当前选中区域的CFI标识
       * @param contents - 当前章节内容实例
       */
      function showHelloworld(cfiRange: string, contents: Contents) {
        if (rendition) {
          // 创建初始选择
          const select: ITextSelection = {
            text: rendition.getRange(cfiRange).toString(),
            cfiRange,
            createdAt: new Date(),
            type:"highlight"
          };
          // 显示菜单
          handleHighlightClick(select, rendition);
          // 清除当前文本选择
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
  }, [rendition]);

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
    <div className="p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">EPUB Reader</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            {showDrawer ? "隐藏批注" : "显示批注"}
          </button>
          <Link href="/books" className="text-blue-600 hover:text-blue-800">
            查看所有书籍 →
          </Link>
        </div>
      </div>

      {/* Drawer for annotations */}
      <div
        className={`fixed top-0 left-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          showDrawer ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 h-full overflow-y-auto">
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
        </div>
      </div>
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
              if (response != null) {
                setAIResponse(response.content);
              }
            } catch (error) {
              console.error("AI request failed:", error);
              setAIResponse("AI请求失败，请稍后再试");
            } finally {
              setAILoading(false);
            }
          }}
          selection={selection!}
          rendition={rendition}
          onAddAnnotation={(annotation) => {
            setSelections((list) => list.concat(annotation));
          }}
          handlehighlightClick={handleHighlightClick}
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
