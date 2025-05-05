"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { loadEpubMetaData,type EpubMetaData } from "@/utils/epub";
import ReaderComponent from "@/app/reader/components/ReaderComponent";

export default function ReaderPage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId");
  const [meta, setMeta] = useState<EpubMetaData | null>(null);

  useEffect(() => {
    if (bookId) {
      loadEpubMetaData(bookId).then((meta) => {
        if (meta) {
          setMeta(meta);
        }
      });
    }
  }, [bookId]);

  if (!bookId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">缺少书籍ID参数</p>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>书籍加载中...</p>
      </div>
    );
  }

  return <ReaderComponent bookId={bookId} initialMeta={meta} />;
}
