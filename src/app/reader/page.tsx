"use client";
import ReaderComponent from "@/app/reader/components/ReaderComponent";
import { type EpubMetaData, loadEpubMetaData } from "@/utils/epub";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReaderPage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId");
  const [meta, setMeta] = useState<EpubMetaData | null>(null);

  useEffect(() => {
    if (bookId) {
      loadEpubMetaData(bookId)
        .then((meta) => {
          if (meta) {
            setMeta(meta);
          }
        })
        .catch((error: unknown) => {
          console.error("loadEpubMetaData", error);
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
