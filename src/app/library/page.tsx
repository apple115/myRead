"use client";
import BookCard from "@/app/library/components/BookCard";
import { EpubUploader } from "@/app/library/components/EpubUploader";
import { deleteAiDialog } from "@/utils/ai-dialog";
import { deleteAnnotations } from "@/utils/annotations";
import {
  type EpubMetaData,
  deleteEpubData,
  deleteEpubImage,
  deleteEpubMetaData,
  getAllEpubMetaData,
} from "@/utils/epub";
import { deletePersist } from "@/utils/persist";
import Link from "next/link";
import { useEffect, useState } from "react";

interface LoadingState {
  books: boolean;
  mindMap: boolean;
}

interface ErrorState {
  books: string | null;
  mindMap: string | null;
}

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

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await getAllEpubMetaData();
        console.log("Epub内容",data)
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

    loadBooks().catch((error: unknown) => {
      console.error("loadBooks", error);
    });
  }, []);

  const handleUploadSuccess = (meta: EpubMetaData | null) => {
    if (meta) {
      setBooks((prevBooks) => [meta, ...prevBooks]);
      setErrors((prev) => ({ ...prev, books: null }));
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      await deleteEpubData(bookId); //删除epub文件
      await deleteEpubMetaData(bookId); //删除元数据
      await deleteEpubImage(bookId); //删除封面图片
      await deleteAiDialog(bookId); //删除对话
      await deleteAnnotations(bookId); //删除笔记
      await deletePersist(bookId);//删除持久化数据
      setBooks((prevBooks) => prevBooks.filter((book) => book.hash !== bookId));
    } catch (error) {
      console.error("Failed to delete book:", error);
      throw error;
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
              <EpubUploader onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        </div>
        {loading.books ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
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
    </div>
  );
}
