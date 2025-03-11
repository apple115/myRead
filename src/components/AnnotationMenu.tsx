interface AnnotationMenuProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
}

export function AnnotationMenu({ position, onClose }: AnnotationMenuProps) {
  if (!position) return null;

  return (
    <>
      <div className="fixed inset-0 bg-opacity-50 z-100" onClick={onClose}>
        <div
          className="fixed bg-white rounded-lg show-xl p-4 z-100"
          style={{
            left: position.x + 10,
            top: position.y + 10,
            zIndex: 9999,
          }}
        >
          <div>复制</div>
          <div>马克笔</div>
          <div>波浪线</div>
          <div>直线</div>
          <div>写想法</div>
          <div>AI问书</div>
        </div>
      </div>
    </>
  );
}
