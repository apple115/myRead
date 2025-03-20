"use client";
import BookCard from "@/components/BookCard";
import { EpubUploader } from "@/components/EpubUploader";
import { useEffect, useState } from "react";
import { getAllEpubMetaData, EpubMetaData, loadEpubData } from "@/utils/epub";
import { askAIWithFile, type AIResponse } from "@/utils/ai";
import { MindMapModal } from "@/components/MindMapModal";

type LoadingState = {
  books: boolean;
  mindMap: boolean;
};

type ErrorState = {
  books: string | null;
  mindMap: string | null;
};

export default function BooksPage() {
  const [books, setBooks] = useState<EpubMetaData[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    books: true,
    mindMap: false,
  });
  const [errors, setErrors] = useState<ErrorState>({
    books: null,
    mindMap: null,
  });
  const [mindMapState, setMindMapState] = useState<{
    visible: boolean;
    content: string;
  }>({
    visible: false,
    content: "",
  });

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await getAllEpubMetaData();
        setBooks(data);
        setErrors((prev) => ({ ...prev, books: null }));
      } catch (error) {
        console.error("Failed to load books:", error);
        setErrors((prev) => ({
          ...prev,
          books: "无法加载书籍列表，请稍后重试",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, books: false }));
      }
    };

    loadBooks();
  }, []);

  const handleUploadSuccess = (meta: EpubMetaData | null) => {
    if (meta) {
      setBooks((prevBooks) => [meta, ...prevBooks]);
      setErrors((prev) => ({ ...prev, books: null }));
    }
  };

  const extractMermaidCode = (text: string): string => {
    const regex = /```mermaid[\s\S]*?```/i;
    const match = text.match(regex);
    if (!match) {
      throw new Error("未找到有效的Mermaid代码块");
    }
    return match[0].replace(/^```mermaid\s*/, "").replace(/\s*```$/, "");
  };

  const generateMindMap = async (bookId: string): Promise<string> => {
    const epubData = await loadEpubData(bookId);
    if (!epubData) {
      throw new Error("无法加载EPUB内容");
    }

    const blob = new Blob([epubData], { type: "application/epub+zip" });
    const file = new File([blob], `${bookId}.epub`, {
      type: "application/epub+zip",
    });

    const question =
      "请根据这本书的内容生成meramid 语法的中文思维导图,直接可以使用的语法不需要其他文字，生成的思维导图不可以太大";
    const response = await askAIWithFile(file, question);
    if (!response?.content) {
      throw new Error("AI没有返回有效的内容");
    }
    return extractMermaidCode(response.content);
  };

  const handleGenerateMindMap = async (bookId: string) => {
    setLoading((prev) => ({ ...prev, mindMap: true }));
    setErrors((prev) => ({ ...prev, mindMap: null }));

    try {
      const mermaidContent = await generateMindMap(bookId);
      setMindMapState({
        visible: true,
        content: mermaidContent,
      });
    } catch (error) {
      console.error("Failed to generate mind map:", error);
      setErrors((prev) => ({
        ...prev,
        mindMap: "生成失败，请稍后重试。",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, mindMap: false }));
    }
  };

  return (
    <div className="p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">我的书架</h1>
        <div className="relative">
          <EpubUploader
            id="epub-upload"
            onUploadSuccess={handleUploadSuccess}
          />
        </div>
      </div>
      {loading.books ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {errors.books && (
            <div className="col-span-full text-center text-red-500 py-8">
              {errors.books}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.length > 0 ? (
              books.map((book) => (
                <BookCard
                  key={book.hash}
                  book={book}
                  onGenerateMindMap={handleGenerateMindMap}
                  isGeneratingMindMap={loading.mindMap}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                书架空空如也，快去添加书籍吧！
              </div>
            )}
          </div>
        </>
      )}
      {mindMapState.visible &&(
        <MindMapModal
          content={mindMapState.content}
          isLoading={loading.mindMap}
          error={errors.mindMap}
          onClose={() => setMindMapState({ visible: false, content: "" })}
        />
      )}
    </div>
  );
}
