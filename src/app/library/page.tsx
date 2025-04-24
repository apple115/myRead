"use client";
import { useEffect, useState } from "react";
import {
  getAllEpubMetaData,
  EpubMetaData,
  loadEpubData,
  deleteEpubData,
  deleteEpubMetaData,
  deleteEpubImage,
} from "@/utils/epub";
import { askAIWithFile } from "@/utils/ai";
import BookCard from "@/app/library/components/BookCard";
import { EpubUploader } from "@/app/library/components/EpubUploader";
import { MindMapModal } from "@/app/library/components/MindMapModal";
import Link from "next/link";

type LoadingState = {
  books: boolean;
  mindMap: boolean;
};

type ErrorState = {
  books: string | null;
  mindMap: string | null;
};

export default function LibraryPage() {
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


  const handleDeleteBook = async (bookId: string) => {
    try {
      await deleteEpubData(bookId);
      await deleteEpubMetaData(bookId);
      await deleteEpubImage(bookId);
      setBooks((prevBooks) => prevBooks.filter((book) => book.hash !== bookId));
    } catch (error) {
      console.error("Failed to delete book:", error);
      throw error;
    }
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
    <div>
      <div className="p-4 relative">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">我的书架</h1>
          <div className="relative">
            <div className="flex">
              <Link
                className="p-2 text-blue-600 hover:text-blue-800"
                href={"/setting"}
              >
                设置
              </Link>
              <EpubUploader
                id="epub-upload"
                onUploadSuccess={handleUploadSuccess}
              />
            </div>
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
                    book={book}
                    onGenerateMindMap={handleGenerateMindMap}
                    isGeneratingMindMap={loading.mindMap}
                    onDelete={handleDeleteBook}
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
      </div>
      {mindMapState.visible && (
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
