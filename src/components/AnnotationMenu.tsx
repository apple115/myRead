interface AnnotationMenuProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
  onAskAI: (text: string) => void;
  selectedText: string;
}

export function AnnotationMenu({
  position,
  onClose,
  onAskAI,
  selectedText,
}: AnnotationMenuProps) {
  if (!position) return null;

  return (
    <div>
      <div className="fixed inset-0 bg-black/20 z-100" onClick={onClose}>
        <div
          className="fixed bg-white rounded-lg shadow-xl p-4 z-100"
          style={{
            left: position.x + 10,
            top: position.y + 10,
            zIndex: 9999,
          }}
          onClick={onClose} // Prevent clicks inside menu from closing it
        >
          <div>复制</div>
          <div>马克笔</div>
          <div>波浪线</div>
          <div>直线</div>
          <div>写想法</div>
          <div
            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
            onClick={async () => {
              console.log("Selected text in menu:", selectedText);
              if (!selectedText.trim()) {
                console.warn("No text selected");
                alert("请先选择一些文本");
                return;
              }
              console.log("Asking AI about text:", selectedText);
              await onAskAI(selectedText);
              onClose();
            }}
          >
            AI问书
          </div>
        </div>
      </div>
    </div>
  );
}
