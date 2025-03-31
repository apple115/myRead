"use client";
import { useEffect, useState } from "react";
import { SelectionList } from "@/components/SelectionList";
import { AIDialog } from "@/components/AIDialog";
import { AnnotationMenu } from "@/components/AnnotationMenu";
import { EpubMetaInfo } from "@/components/EpubMetaInfo";
import { EpubReaderContainer } from "@/components/EpubReaderContainer";
import { loadEpubData } from "@/utils/epub";
import { callAI } from "@/utils/ai";
import { BaseDirectory, exists, readFile } from "@tauri-apps/plugin-fs";
import { type Rendition, type Contents } from "epubjs";
import type { ITextSelection } from "@/types/annotation";
import Link from "next/link";
import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir } from "@tauri-apps/api/path";

interface ReaderComponentProps {
  bookId: string;
  initialMeta: {
    title: string;
    author: string;
    description?: string;
  };
}

export default function ReaderComponent({
  bookId,
  initialMeta,
}: ReaderComponentProps) {
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

  function handleHighlightClick(
    selection: ITextSelection,
    rendition: Rendition,
  ) {
    if (rendition) {
      const range = rendition.getRange(selection.cfiRange);
      const rects = range.getClientRects();
      const readerContainer = document.querySelector(".epub-container")!;
      const rect = readerContainer.getBoundingClientRect();

      setSelection(selection);
      setMenuPosition({
        x: rects[0].x + rect.x,
        y: rects[0].y + rect.y,
      });
      setShowMenu(true);
    }
  }

  useEffect(() => {
    if (rendition) {
      function showHelloworld(cfiRange: string, contents: Contents) {
        if (rendition) {
          const select: ITextSelection = {
            text: rendition.getRange(cfiRange).toString(),
            cfiRange,
            createdAt: new Date(),
            type: "highlight",
          };
          handleHighlightClick(select, rendition);
          const selection = contents.window.getSelection();
          selection?.removeAllRanges();
        }
      }
      rendition.on("selected", showHelloworld);
      return () => {
        rendition?.off("selected", showHelloworld);
      };
    }
  }, [rendition]);

  useEffect(() => {
    const loadEpub = async () => {
      try {
        const appData = await appDataDir();
        const filePath = `epub-data/${bookId}.epub`;
        const fullPath = `${appData}/${filePath}`;
        if (await exists(filePath, { baseDir: BaseDirectory.AppData })) {
          setEpubFileUrl(convertFileSrc(fullPath));
        }
      } catch (error) {
        console.error("Failed to conver EPUB to url", error);
        alert("Failed to load EPUB file");
      }
    };
    loadEpub();
  }, [bookId]);

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
          position={menuPosition}
          onClose={() => setShowMenu(false)}
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
          handlehighlightClick={handleHighlightClick}
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
