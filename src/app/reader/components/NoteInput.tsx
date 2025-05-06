import type { ITextSelection } from "@/types/annotation";
import type { Rendition } from "epubjs";
import { useState } from "react";

interface NoteInputProps {
  rendition: Rendition | null;
  selection: ITextSelection;
  /**
   * 初始选中的文本内容，会显示在笔记输入框上方
   */
  initialText: string;
  /** 添加新标注的回调 */
  onAddAnnotation: (annotation: ITextSelection) => void;
  /** 点击高亮标注的回调 */
  handlehighlightClick: (select: ITextSelection, rendition: Rendition) => void;
  /** 取消按钮的回调 */
  onClose: () => void;
}

export function NoteInput({
  selection,
  rendition,
  initialText,
  onClose,
  onAddAnnotation,
  handlehighlightClick,
}: NoteInputProps) {
  const [note, setNote] = useState(String);
  const handleSave = () => {
    if (note.trim()) {
      const annotation: ITextSelection = {
        ...selection,
        note: note,
        styles: {
          fill: "rgba(144, 238, 144, 0.4)",
          "border-radius": "3px",
          "border-bottom": "2px solid rgba(0, 128, 0, 0.6)",
        },
      };
      annotation.type = "underline";
      onAddAnnotation(annotation);
      if (rendition) {
        rendition.annotations.highlight(
          selection.cfiRange,
          {},
          () => {
            handlehighlightClick(selection, rendition);
          },
          "underline",
          {
            ...annotation.styles,
            "pointer-events": "all",
            cursor: "pointer",
          },
        );
      }
    }
    onClose();
  };
  const handeCancel = () => {
    setNote("");
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">写想法</h3>
          <button
            type="button"
            onClick={handeCancel}
            className="text-gray-500 hover:text-gray-700"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") {
                handeCancel();
              }
            }}
          >
            &times;
          </button>
        </div>
        <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
          <p className="text-gray-800">{initialText}</p>
        </div>
        <textarea
          className="w-full border rounded p-2 mb-4 h-32"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
          }}
          placeholder="输入你的想法..."
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 border rounded hover:bg-gray-100"
            onClick={handeCancel}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") {
                handeCancel();
              }
            }}
          >
            取消
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              handleSave();
            }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") {
                handleSave();
              }
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
