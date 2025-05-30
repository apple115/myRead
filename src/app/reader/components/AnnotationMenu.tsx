import type { ITextSelection } from "@/types/annotation";
import type { Contents, Rendition } from "epubjs";

interface AnnotationMenuProps {
  /** EPUB内容对象 */
  contents: Contents | null;
  /** 菜单显示位置坐标 */
  position: { x: number; y: number } | null;
  /** 关闭菜单回调 */
  onClose: () => void;
  /** 当前选中的文本内容 */
  selection: ITextSelection;
  /** EPUB渲染对象 */
  rendition: Rendition | null;
  /** 添加新标注的回调 */
  onAddAnnotation: (annotation: ITextSelection) => void;
  /** 点击高亮标注的回调 */
  handlehighlightClick: (select: ITextSelection, rendition: Rendition) => void;

  setShowNoteInput: (show: boolean) => void;
  setShowAIDialog: (open: boolean) => void;

  /** 删除标注的回调 */
  handleRemoveAnnotation: (annotation: ITextSelection) => void;
}

// 菜单项组件
function MenuItem({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // 检查按下的键是否为 Enter 键或 Space 键
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); // 防止默认行为，如滚动页面
      onClick?.(); // 调用 onClick 处理函数
    }
  };
  return (
    <div
      className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded cursor-pointer transition-colors"
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

export function AnnotationMenu({
  position,
  onClose,
  selection,
  rendition,
  onAddAnnotation,
  handlehighlightClick,
  setShowNoteInput,
  setShowAIDialog,
  handleRemoveAnnotation,
}: AnnotationMenuProps) {
  if (!position) return null;
  return (
    <div
      className="fixed inset-0 z-[9998]"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Escape") {
          onClose();
        }
      }}
    >
      <div
        className="absolute bg-white rounded-lg shadow-xl p-2 z-[9999] min-w-[160px]"
        style={{
          left: position.x + 10,
          top: position.y + 10,
        }}
      >
        <MenuItem
          onClick={() => {
            navigator.clipboard
              .writeText(selection.text ?? "")
              .catch(console.error);
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
              () => {
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
              () => {
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
              () => {
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
          下划线
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowNoteInput(true);
            onClose();
          }}
        >
          写想法
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowAIDialog(true);
            onClose();
          }}
        >
          AI问书
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleRemoveAnnotation(selection);
            onClose();
          }}
        >
          删除
        </MenuItem>
      </div>
    </div>
  );
}
