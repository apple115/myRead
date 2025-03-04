"use client";
import { useCallback, useState } from "react";
import { saveEpubData, getEpubMetadate, saveEpubMetaData } from "@/utils/epub";

import type { EpubMetaData } from "@/utils/epub";

interface EpubUploaderProps {
  onUploadSuccess: (meta: EpubMetaData|null) => void;
  onUploadError?: (error: Error) => void;
}

export function EpubUploader({
  onUploadSuccess,
  onUploadError,
}: EpubUploaderProps) {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setLoading(true);
      try {
        // 保存EPUB文件并获取唯一ID
        const epubId = await saveEpubData(file);

        const meta = await getEpubMetadate(epubId);

        // 保存EpubMeta文件
        await saveEpubMetaData(epubId, meta);

        onUploadSuccess(meta);
      } catch (error) {
        console.error("Failed to process EPUB:", error);
        onUploadError?.(error as Error);
      } finally {
        setLoading(false);
      }
    },
    [onUploadSuccess, onUploadError],
  );

  return (
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
      {loading && <p className="text-gray-500">Loading EPUB file...</p>}
    </div>
  );
}
