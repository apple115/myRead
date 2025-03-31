interface AIDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  content: string;
  onClose: () => void;
}

export function AIDialog({
  isOpen,
  isLoading,
  content,
  onClose,
}: AIDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">AI 回复</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <div className="min-h-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse">AI正在思考中，请稍候...</div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>
      </div>
    </div>
  );
}
