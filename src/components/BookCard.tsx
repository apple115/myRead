import Link from "next/link";
import { EpubMetaData } from "@/utils/epub";
import { useState, useEffect } from "react";

interface BookCardProps {
  book: EpubMetaData;
  onGenerateMindMap: (bookId: string) => void;
  isGeneratingMindMap: boolean;
}

export default function BookCard({
  book,
  onGenerateMindMap,
  isGeneratingMindMap,
}: BookCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setMenuOpen(false);
    };

    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  const handleGenerateMindMap = async () => {
    try {
      await onGenerateMindMap(book.hash);
      setMenuOpen(false);
    } catch (error) {
      console.error("Failed to generate mind map:", error);
    }
  };

  return (
    <div
      className="relative"
      onContextMenu={handleContextMenu}
      onClick={() => setMenuOpen(false)}
    >
      <Link
        href={`/reader?bookId=${encodeURIComponent(book.hash)}`}
        className="group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow block"
      >
        <div className="aspect-[2/3] bg-gray-100 relative">
          {/* 封面图片占位符 */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-lg font-semibold truncate mb-1">{book.title}</h2>
          <p className="text-sm text-gray-600 truncate">
            {book.author || "未知作者"}
          </p>
          {book.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {book.description}
            </p>
          )}
        </div>
      </Link>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-100"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg"
            style={{
              top: menuPosition.y,
              left: menuPosition.x,
            }}
          >
            <button
              onClick={handleGenerateMindMap}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              disabled={isGeneratingMindMap}
            >
              {isGeneratingMindMap ? "思维导图正在生成..." : "生成思维导图"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
