"use client";
import { useCallback, useState } from "react";
import { saveEpubData, loadEpubMetaData } from "@/utils/epub";

export default function Home() {
  const [epubMeta, setEpubMeta] = useState<{
    title: string;
    author: string;
    description?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setLoading(true);
      try {
        // 保存EPUB文件并获取唯一ID
        const uniqueId = await saveEpubData(file);
        // 加载并显示元数据
        const meta = await loadEpubMetaData(uniqueId);
        setEpubMeta(meta);
      } catch (error) {
        console.error("Failed to process EPUB:", error);
        alert("Failed to process EPUB file");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">EPUB Reader</h1>

      <div className="mb-4">
        <label className="block mb-2">
          <span className="sr-only">Choose EPUB file</span>
          <input
            type="file"
            accept=".epub"
            onChange={handleFileUpload}
            disabled={loading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </label>
      </div>

      {loading && <p className="text-gray-500">Loading EPUB file...</p>}

      {epubMeta && (
        <div className="mt-4 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold">{epubMeta.title}</h2>
          <p className="text-gray-600 mt-2">Author: {epubMeta.author}</p>
          {epubMeta.description && (
            <p className="text-gray-600 mt-2">{epubMeta.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
