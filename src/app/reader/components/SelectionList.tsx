import { useEffect, useState } from "react";
import type { Rendition } from "epubjs";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Trash2, Eye, Check, X } from "lucide-react";

interface Selection {
  text: string | null;
  cfiRange: string;
  createdAt: Date;
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
      {selections.map(({ text, cfiRange, createdAt }, i) => (
        <div
          key={i}
          className="group relative p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm text-gray-600 mb-1">
            {formatDistanceToNow(createdAt, { addSuffix: true, locale: zhCN })}
          </div>
          <div className="text-gray-800">{text}</div>

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {confirmDeleteIndex === i ? (
              <div className="flex gap-1">
                <button
                  onClick={() => handleRemove(i, cfiRange)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="确认删除"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => setConfirmDeleteIndex(null)}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  title="取消"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-1">
                <button
                  onClick={() => rendition?.display(cfiRange)}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  title="跳转到位置"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleRemove(i, cfiRange)}
                  className="p-1 text-gray-600 hover:bg-red-50 rounded"
                  title="删除批注"
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
