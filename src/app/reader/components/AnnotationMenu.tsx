import type { ITextSelection} from "@/types/annotation";
import type { Rendition,Contents } from "epubjs";

interface AnnotationMenuProps {
  contents:Contents | null,
  position: { x: number; y: number } | null;
  onClose: () => void;
  onAskAI: (text: string) => void;
  selection: ITextSelection;
  rendition: Rendition | null;
  onAddAnnotation: (annotation: ITextSelection) => void;
  handlehighlightClick: (select: ITextSelection, rendition: Rendition) => void;
}

// 菜单项组件
function MenuItem({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded cursor-pointer transition-colors"
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function AnnotationMenu({
  position,
  onClose,
  onAskAI,
  selection,
  rendition,
  onAddAnnotation,
  handlehighlightClick,
  contents,
}: AnnotationMenuProps) {
  if (!position) return null;
  return (
    <div className="fixed inset-0 z-[9998]" onClick={onClose}>
      <div
        className="absolute bg-white rounded-lg shadow-xl p-2 z-[9999] min-w-[160px]"
        style={{
          left: position.x + 10,
          top: position.y + 10,
        }}
      >
        <MenuItem
          onClick={() => {
            navigator.clipboard.writeText(selection.text || "");
            onClose();
          }}
        >
          复制
        </MenuItem>
        <MenuItem
          onClick={() => {
            const styles = {
              fill: "rgba(255, 235, 59, 0.3)",
              "fill-opacity": "0.5",
              border: "1px solid rgba(255, 152, 0, 0.5)",
            };
            onAddAnnotation({
              ...selection,
              type: "highlight",
              styles: styles,
            });
            rendition?.annotations.highlight(
              selection.cfiRange,
              {},
              (e: MouseEvent) => {
                handlehighlightClick(selection, rendition);
              },
              "highlight",
              { ...styles, "pointer-events": "all", cursor: "pointer" },
            );
            onClose();
          }}
        >
          高亮
        </MenuItem>
        <MenuItem
          onClick={() => {
            const styles = {
              "border-bottom": "2px dashed rgba(0, 0, 255, 0.6)",
            };
            onAddAnnotation({
              ...selection,
              type: "underline",
              styles: styles,
            });
            rendition?.annotations.highlight(
              selection.cfiRange,
              {},
              (e: MouseEvent) => {
                handlehighlightClick(selection, rendition);
              },
              "underline",
              {
                ...styles,
                "pointer-events": "all",
                cursor: "pointer",
              },
            );
            onClose();
          }}
        >
          波浪线
        </MenuItem>
        <MenuItem
          onClick={() => {
            const styles = {
              "border-bottom": "1px dashed rgba(76, 175, 80, 0.8)",
            };
            onAddAnnotation({
              ...selection,
              type: "underline",
              styles: styles,
            });
            rendition?.annotations.underline(
              selection.cfiRange,
              {},
              (e: MouseEvent) => {
                handlehighlightClick(selection, rendition,contents);
              },
              "underline",
              {
                ...styles,
                "pointer-events": "all",
                cursor: "pointer",
              },
            );
            onClose();
          }}
        >
          下划线
        </MenuItem>
        <MenuItem
          onClick={() => {
            const note = prompt("请输入你的想法：");
            if (note && rendition) {
              const annotatedSelection = {
                ...selection,
                text: note, // 用笔记内容替换原有文本
                createdAt: new Date(),
              };
              onAddAnnotation(annotatedSelection);
              // 添加高亮
              rendition.annotations.highlight(
                selection.cfiRange,
                {},
                () => {},
                "note",
                {
                  fill: "rgba(144, 238, 144, 0.4)", // 浅绿色
                  "border-radius": "3px",
                  "border-bottom": "2px solid rgba(0, 128, 0, 0.6)",
                  "pointer-events": "all",
                  cursor: "pointer",
                },
              );
              onClose();
            }
          }}
        >
          写想法
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (!selection.text?.trim()) {
              alert("请先选择一些文本");
              return;
            }
            await onAskAI(selection.text);
            onClose();
          }}
        >
          AI问书
        </MenuItem>
      </div>
    </div>
  );
}
