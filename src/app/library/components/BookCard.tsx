import AiBookDialog from "@/app/library/components/AiBookDialog";
import { type EpubMetaData, getEpubImage } from "@/utils/epub";
import Link from "next/link";
import { ContextMenu } from "radix-ui";
import { useEffect, useState } from "react";

interface BookCardProps {
  book: EpubMetaData;
  onDelete: (bookId: string) => Promise<void>;
}

export default function BookCard({ book, onDelete }: BookCardProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [openAiBookDialog, setOpenAiBookDialog] = useState(false);

  useEffect(() => {
    const loadCover = async () => {
      try {
        const url = await getEpubImage(book.hash);
        setCoverUrl(url);
      } catch (error) {
        console.error("封面加载失败:", error);
        setCoverUrl(null);
      }
    };
    loadCover().catch((error: unknown) => {
      console.error("loadCover:", error);
    });
  }, [book.hash]);

  return (
    <div className="relative">
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          <Link
            href={`/reader?bookId=${encodeURIComponent(book.hash)}`}
            className="group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow block"
          >
            <div className="aspect-[2/3] bg-gray-100 relative">
              {/* 封面图片占位符 */}
              {coverUrl && (
                <img
                  src={coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover absolute inset-0"
                  onError={(e) => {
                    // 图片加载失败时隐藏图片元素
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              {!coverUrl && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="封面加载失败"
                  >
                    <title>封面加载失败</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold truncate mb-1">
                {book.title}
              </h2>
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
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className="bg-white overflow-hidden rounded-md min-w-[100px]">
            <Link
              href={`/mindMap?bookId=${encodeURIComponent(book.hash)}`}
              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
            >
              生成思维导图
            </Link>
            <ContextMenu.Item
              onClick={() => {
                setOpenAiBookDialog(true);
              }}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
            >
              对话书本
            </ContextMenu.Item>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(book.hash).catch(console.error);
              }}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
            >
              删除书籍
            </button>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <AiBookDialog
        bookId={book.hash}
        open={openAiBookDialog}
        setOpen={setOpenAiBookDialog}
      />
    </div>
  );
}
