"use client";
import { useEffect, useState } from "react";
import { ReactReader } from "react-reader";
import { loadEpubData, loadEpubMetaData } from "@/utils/epub";
import { BaseDirectory, open, readFile } from "@tauri-apps/plugin-fs";

export default function Home() {
  const [epubFile, setEpubFile] = useState<Uint8Array | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [epubMeta, setEpubMeta] = useState<{
    title: string;
    author: string;
    description?: string;
  } | null>(null);

  // 使用已知的 epubId 进行测试
  const epubId =
    "4345964574e1dbb72dccfc7863417b9dc3126707f20c3274b954eda53728dbac";

  useEffect(() => {
    const loadEpub = async () => {
      try {
        // 加载 EPUB 文件内容
        const filePath = `epub-data/${epubId}.epub`;
        const data = await readFile(filePath, {
          baseDir: BaseDirectory.AppData,
        });
        setEpubFile(data);
        // // 加载 EPUB 元数据
        const meta = await loadEpubMetaData(epubId);
        setEpubMeta(meta);
      } catch (error) {
        console.error("Failed to load EPUB:", error);
        alert("Failed to load EPUB file");
      }
    };

    loadEpub();
  }, [epubId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">EPUB Reader</h1>
      {epubMeta && (
        <div className="mt-4">
          <div className="p-4 border rounded-lg mb-4">
            <h2 className="text-xl font-semibold">{epubMeta.title}</h2>
            <p className="text-gray-600 mt-2">Author: {epubMeta.author}</p>
            {epubMeta.description && (
              <p className="text-gray-600 mt-2">{epubMeta.description}</p>
            )}
          </div>
          {epubFile && (
            <div className="mt-4 h-[80vh] border rounded-lg overflow-hidden">
              <ReactReader
                url={epubFile?.buffer}
                location={location}
                locationChanged={(loc: string) => setLocation(loc)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
