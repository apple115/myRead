import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { Rendition } from "epubjs";
import { Check, Eye, Trash2, X } from "lucide-react";
import { useState } from "react";

interface Selection {
  text: string | null;
  cfiRange: string;
  createdAt: Date;
  note?: string;
}

interface SelectionListProps {
  selections: Selection[];
  rendition: Rendition | null;
  onRemove: (cfiRange: string) => void;
  showHighlights?: boolean;
}

export function SelectionList({
  selections,
  rendition,
  onRemove,
}: SelectionListProps) {
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(
    null,
  );

  const handleRemove = (index: number, cfiRange: string) => {
    if (confirmDeleteIndex === index) {
      onRemove(cfiRange);
      setConfirmDeleteIndex(null);
    } else {
      setConfirmDeleteIndex(index);
    }
  };

  return (
    <div className="space-y-2">
      {selections.map(({ text, cfiRange, createdAt, note }, i) => (
        <div
          key={i}
          className="group relative p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm text-gray-600 mb-1">
            {formatDistanceToNow(createdAt, { addSuffix: true, locale: zhCN })}
          </div>
          <div className="text-gray-800">{text}</div>
          {note && (
            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-100 text-sm text-blue-800">
              {note}
            </div>
          )}

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {confirmDeleteIndex === i ? (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    handleRemove(i, cfiRange);
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="确认删除"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Escape") {
                      handleRemove(i, cfiRange);
                    }
                  }}
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDeleteIndex(null);
                  }}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  title="取消"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Escape") {
                      setConfirmDeleteIndex(null);
                    }
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    rendition?.display(cfiRange).catch(console.error);
                  }}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  title="跳转到位置"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Escape") {
                      rendition?.display(cfiRange).catch(console.error);
                    }
                  }}
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRemove(i, cfiRange);
                  }}
                  className="p-1 text-gray-600 hover:bg-red-50 rounded"
                  title="删除批注"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Escape") {
                      handleRemove(i, cfiRange);
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
