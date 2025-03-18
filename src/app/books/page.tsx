"use client";
import BookCard from "@/components/BookCard";
import { EpubUploader } from "@/components/EpubUploader";
import { useEffect, useState } from "react";
import { getAllEpubMetaData, EpubMetaData, loadEpubData } from "@/utils/epub";
import { askAIWithFile } from "@/utils/ai";
import { MindMapModal } from "@/components/MindMapModal";

export default function BooksPage() {
  const [books, setBooks] = useState<EpubMetaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMindMap, setShowMindMap] = useState(false);
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [mindMapContent, setMindMapContent] = useState("");
  const [mindMapError, setMindMapError] = useState("");

  useEffect(() => {
    async function loadBooks() {
      try {
        const data = await getAllEpubMetaData();
        setBooks(data);
      } catch (error) {
        console.error("Failed to load books:", error);
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, []);

  const handleUploadSuccess = (meta: EpubMetaData | null) => {
    if (meta) {
      setBooks((prevBooks) => [meta, ...prevBooks]);
    }
  };

  const extractMermaidCode = (text: string): string => {
    const regex = /```mermaid[\s\S]*?```/i;
    const match = text.match(regex);
    if (!match) return "";
    // 去除代码块标记
    return match[0].replace(/^```mermaid\s*/, "").replace(/\s*```$/, "");
  };
  const handleGenerateMindMap = async (bookId: string)=>{
    setIsGeneratingMindMap(true);
    setMindMapError("");
    try {
      console.log("bookId:", bookId);
      const epubData = await loadEpubData(bookId);
      if (!epubData) {
        throw new Error("无法加载EPUB内容");
      }
      // 将Uint8Array转换为Blob对象
      const blob = new Blob([epubData], { type: "application/epub+zip" });
      const file = new File([blob], `${bookId}.epub`, {
        type: "application/epub+zip",
      });
      console.log("book:", file);

      const question =
        "请根据这本书的内容生成meramid 语法的中文思维导图,直接可以使用的语法不需要其他文字，生成的思维导图不可以太大";
      const response = await askAIWithFile(file, question);
      if (!response) {
        throw new Error("AI没有返回有效的内容");
      }
      // 提取完整代码块
      const mermaidBlock = extractMermaidCode(response);
      if (!mermaidBlock) throw new Error("未找到有效的Mermaid代码块");

      console.log("代码块", mermaidBlock);
      setMindMapContent(mermaidBlock);
      setShowMindMap(true);
      // 调用AI生成思维导图
    } catch (error) {
      console.error("Failed to generate mind map:", error);
      setMindMapError("生成失败，请稍后重试。");
      throw error;
    } finally {
      setIsGeneratingMindMap(false);
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
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {books.length > 0 ? (
            books.map((book) => (
              <BookCard
                key={book.hash}
                book={book}
                onGenerateMindMap={handleGenerateMindMap}
                isGeneratingMindMap={isGeneratingMindMap}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              书架空空如也，快去添加书籍吧！
            </div>
          )}
        </div>
      )}
      {isGeneratingMindMap && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-md">
            <p>思维导图正在生成，请稍候...</p>
          </div>
        </div>
      )}
      {mindMapError && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-md">
            <p className="text-red-500">{mindMapError}</p>
          </div>
        </div>
      )}
      {showMindMap && (
        <MindMapModal
          content={mindMapContent}
          onClose={() => setShowMindMap(false)}
        />
      )}
    </div>
  );
}
