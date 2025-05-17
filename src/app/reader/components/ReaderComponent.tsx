"use client";
import { AnnotationMenu } from "@/app/reader/components/AnnotationMenu";
import { EpubMetaInfo } from "@/app/reader/components/EpubMetaInfo";
import { EpubReaderContainer } from "@/app/reader/components/EpubReaderContainer";
import { SelectionList } from "@/app/reader/components/SelectionList";
import { useAnnotations } from "@/app/reader/hooks/useAnnotations";
import type { ITextSelection } from "@/types/annotation";
import type { Reader } from "@/types/book";
import type { Persist } from "@/utils/persist";
import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir } from "@tauri-apps/api/path";
import { BaseDirectory, exists } from "@tauri-apps/plugin-fs";
import type { Contents, Rendition } from "epubjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePersist } from "../hooks/usePersist";
import { AIInputOutput } from "./AIDialog";
import { NoteInput } from "./NoteInput";

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
  const [contents, setContents] = useState<Contents | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showAIInputOutput, setShowAIInputOutput] = useState(false);

  const handleTextSelection = useCallback(
    (newSelection: ITextSelection, rendition: Rendition) => {
      const range = rendition.getRange(newSelection.cfiRange);
      const rects = range.getClientRects();
      const readerContainer = document.querySelector(".epub-container");
      if (readerContainer) {
        const rect = readerContainer.getBoundingClientRect();
        setMenuPosition({
          x: rects[0].x + rect.x,
          y: rects[0].y + rect.y,
        });
      }
      setSelection(newSelection);
      setShowMenu(true);
    },
    [],
  );

  const handleSelectionEvent = useCallback(
    (cfiRange: string, contents: Contents) => {
      if (rendition) {
        const newSelection: ITextSelection = {
          text: rendition.getRange(cfiRange).toString(),
          cfiRange,
          createdAt: new Date(),
          type: "highlight",
          styles: {},
        };
        setContents(contents);
        setSelection(newSelection);
        handleTextSelection(newSelection, rendition);
      }
    },
    [rendition, handleTextSelection],
  );

  useEffect(() => {
    if (rendition) {
      rendition.on("selected", handleSelectionEvent);
      return () => {
        rendition.off("selected", handleSelectionEvent);
      };
    }
  }, [rendition, handleSelectionEvent]);

  const loadEpubFile = useCallback(async () => {
    try {
      const appData = await appDataDir();
      const filePath = `epub-data/${bookId}.epub`;
      const fullPath = `${appData}/${filePath}`;
      if (await exists(filePath, { baseDir: BaseDirectory.AppData })) {
        setEpubFileUrl(convertFileSrc(fullPath));
      }
      loadSavedPersist().catch((error: unknown) => {
        console.error("loadSavedPersist", error);
      });
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
  }, [bookId, loadPersist]);

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
  }, [location, bookId, savePersist]);

  const { saveAnnotations, loadAnnotations } = useAnnotations();

  // 加载注释
  const loadSavedAnnotations = useCallback(async () => {
    try {
      const savedAnnotations = await loadAnnotations(bookId);
      setSelections(savedAnnotations);
      // 恢复高亮显示
      if (rendition) {
        for (const annotation of savedAnnotations) {
          rendition.annotations.add(
            annotation.type,
            annotation.cfiRange,
            {},
            () => {
              handleTextSelection(annotation, rendition);
            },
            "hl",
            annotation.styles,
          );
        }
      }
    } catch (error) {
      console.error("加载注释失败:", error);
    }
  }, [bookId, rendition, loadAnnotations, handleTextSelection]);

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
      saveCurrentAnnotations().catch(console.error);
    }
  }, [selections, saveCurrentAnnotations]);

  useEffect(() => {
    loadEpubFile().catch(console.error);
    loadSavedAnnotations().catch(console.error);
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
          <button
            type="button"
            onClick={() => {
              saveCurrentPersist().catch(console.error);
            }}
          >
            保存
          </button>
          <button
            type="button"
            onClick={() => {
              setShowDrawer(!showDrawer);
              setShowMenu(false);
            }}
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
      {showMenu && selection && (
        <AnnotationMenu
          contents={contents}
          position={menuPosition}
          onClose={() => {
            setShowMenu(false);
            // setSelection(null);
            const selection = contents?.window.getSelection();
            selection?.removeAllRanges();
          }}
          selection={selection} //选择的区域
          rendition={rendition}
          onAddAnnotation={(annotation) => {
            setSelections((list) => list.concat(annotation));
          }}
          handlehighlightClick={handleTextSelection}
          setShowNoteInput={setShowNoteInput}
          setShowAIDialog={setShowAIInputOutput}
          handleRemoveAnnotation={(annotation) => {
            rendition?.annotations.remove(annotation.cfiRange, annotation.type);
            setSelections(
              selections.filter(
                (item) => item.cfiRange !== annotation.cfiRange,
              ),
            );
          }}
        />
      )}
      <div className="mt-4">
        <EpubMetaInfo meta={initialMeta} />
        {epubFileUrl && (
          <EpubReaderContainer
            epubFileUrl={epubFileUrl}
            location={location}
            onLocationChange={(loc: string) => {
              setLocation(loc);
            }}
            onRenditionChange={(_rendition: Rendition) => {
              setRendition(_rendition);
            }}
          />
        )}
      </div>
      {showNoteInput && selection && (
        <NoteInput
          selection={selection}
          rendition={rendition}
          initialText={selection.text ?? ""}
          onAddAnnotation={(annotation) => {
            setSelections((list) => list.concat(annotation));
          }}
          handlehighlightClick={handleTextSelection}
          onClose={() => {
            setShowNoteInput(false);
          }}
        />
      )}
      <AIInputOutput
        text={selection?.text ?? ""}
        isOpen={showAIInputOutput}
        setIsOpen={setShowAIInputOutput}
      />
    </div>
  );
}
