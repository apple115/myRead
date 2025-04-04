"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { SelectionList } from "@/app/reader/components/SelectionList";
import { AIDialog } from "@/app/reader/components/AIDialog";
import { AnnotationMenu } from "@/app/reader/components/AnnotationMenu";
import { EpubMetaInfo } from "@/app/reader/components/EpubMetaInfo";
import { EpubReaderContainer } from "@/app/reader/components/EpubReaderContainer";
import { callAI } from "@/utils/ai";
import { useAnnotations } from "@/app/reader/hooks/useAnnotations";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import { Contents, type Rendition } from "epubjs";
import type { ITextSelection } from "@/types/annotation";
import Link from "next/link";
import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir } from "@tauri-apps/api/path";
import { Reader } from "@/types/book";
import { usePersist } from "../hooks/usePersist";
import { type Persist } from "@/utils/persist";

export default function ReaderComponent({ bookId, initialMeta }: Reader) {
  const [epubFileUrl, setEpubFileUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [selections, setSelections] = useState<ITextSelection[]>([]);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selection, setSelection] = useState<ITextSelection | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isAIDialogOpen, setAIDialogOpen] = useState(false);
  const [isAILoading, setAILoading] = useState(false);
  const [aiResponse, setAIResponse] = useState("");
  const [contents, setContents] = useState<Contents | null>(null);

  const handleTextSelection = (
    newSelection: ITextSelection,
    rendition: Rendition,
  ) => {
    if (rendition) {
      const range = rendition.getRange(newSelection.cfiRange);
      const rects = range.getClientRects();
      const readerContainer = document.querySelector(".epub-container")!;
      const rect = readerContainer.getBoundingClientRect();
      setSelection(newSelection);
      setMenuPosition({
        x: rects[0].x + rect.x,
        y: rects[0].y + rect.y,
      });
      setShowMenu(true);
    }
  };

  const handleSelectionEvent = (cfiRange: string, contents: Contents) => {
    if (rendition) {
      const newSelection: ITextSelection = {
        text: rendition.getRange(cfiRange).toString(),
        cfiRange,
        createdAt: new Date(),
        type: "highlight",
        styles: {},
      };
      setContents(contents);
      handleTextSelection(newSelection, rendition);
    }
  };

  useEffect(() => {
    if (rendition) {
      rendition.on("selected", handleSelectionEvent);
      return () => {
        rendition?.off("selected", handleSelectionEvent);
      };
    }
  }, [rendition]);

  const loadEpubFile = useCallback(async () => {
    try {
      const appData = await appDataDir();
      const filePath = `epub-data/${bookId}.epub`;
      const fullPath = `${appData}/${filePath}`;
      if (await exists(filePath, { baseDir: BaseDirectory.AppData })) {
        setEpubFileUrl(convertFileSrc(fullPath));
      }
      loadSavedPersist();
    } catch (error) {
      console.error("Failed to convert EPUB to URL", error);
      alert("Failed to load EPUB file");
    }
  }, [bookId]);

  const { savePersist, loadPersist } = usePersist();

  const loadSavedPersist = useCallback(async () => {
    try {
      const savedPersist = await loadPersist(bookId);
      if (savedPersist != null) {
        setLocation(savedPersist.location);
      }
    } catch (error) {
      console.error("加载Persist失败:", error);
    }
  }, [bookId]);

  const saveCurrentPersist = useCallback(async () => {
    try {
      const persist: Persist = {
        location: location,
      };
      console.log("saveCurrentPersist:", location);
      await savePersist(bookId, persist);
    } catch (error) {
      console.error("存储Persist失败", error);
    }
  }, [location]);

  const { saveAnnotations, loadAnnotations } = useAnnotations();

  // 加载注释
  const loadSavedAnnotations = useCallback(async () => {
    try {
      const savedAnnotations = await loadAnnotations(bookId);
      setSelections(savedAnnotations);
      // 恢复高亮显示
      if (rendition) {
        savedAnnotations.forEach((annotation) => {
          rendition.annotations.add(
            annotation.type,
            annotation.cfiRange,
            {},
            undefined,
            "hl",
            { fill: "yellow", "fill-opacity": "0.3" },
          );
        });
      }
    } catch (error) {
      console.error("加载注释失败:", error);
    }
  }, [bookId, rendition, loadAnnotations]);

  // 保存注释到文件
  const saveCurrentAnnotations = useCallback(async () => {
    try {
      await saveAnnotations(bookId, selections);
    } catch (error) {
      console.error("保存注释失败:", error);
    }
  }, [bookId, selections, saveAnnotations]);

  // 自动保存注释
  useEffect(() => {
    if (selections.length > 0) {
      saveCurrentAnnotations();
    }
  }, [selections, saveCurrentAnnotations]);

  useEffect(() => {
    loadEpubFile();
    loadSavedAnnotations();
  }, [loadEpubFile, loadSavedAnnotations]);

  //FIX: 无法自动保存
  // useEffect(()=>{
  //   saveCurrentPersist();
  // },[location])

  return (
    <div className="p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">EPUB Reader</h1>
        <div className="flex gap-4">
          <button onClick={() => saveCurrentPersist()}>保存</button>
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            {showDrawer ? "隐藏批注" : "显示批注"}
          </button>
          <Link
            href="/library"
            className="p-2 text-blue-600 hover:text-blue-800"
          >
            返回书架 →
          </Link>
        </div>
      </div>
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
          contents={contents}
          position={menuPosition}
          onClose={() => {
            setShowMenu(false);
            const selection = contents?.window.getSelection();
            selection?.removeAllRanges();
          }}
          onAskAI={async (text) => {
            try {
              if (!text.trim()) {
                alert("请先选择一些文本");
                return;
              }
              setAIDialogOpen(true);
              setAILoading(true);
              setAIResponse("");
              const response = await callAI(`请解释这段话的含义: ${text}`);
              if (response != null) {
                setAIResponse(response.content);
              }
            } catch (error) {
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
          handlehighlightClick={handleTextSelection}
        />
      )}
      <div className="mt-4">
        <EpubMetaInfo meta={initialMeta} />
        {epubFileUrl && (
          <EpubReaderContainer
            epubFileUrl={epubFileUrl}
            location={location}
            onLocationChange={(loc: string) => setLocation(loc)}
            onRenditionChange={(_rendition: Rendition) => {
              setRendition(_rendition);
            }}
          />
        )}
      </div>
      <AIDialog
        isOpen={isAIDialogOpen}
        isLoading={isAILoading}
        content={aiResponse}
        onClose={() => setAIDialogOpen(false)}
      />
    </div>
  );
}
