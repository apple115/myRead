"use client";
import { useCallback, useState, useRef } from "react";
import {
  saveEpubData,
  getEpubMetadate,
  saveEpubMetaData,
  saveEpubImage,
} from "@/utils/epub";
import { Toast } from "radix-ui";
import type { EpubMetaData } from "@/utils/epub";

interface EpubUploaderProps {
  onUploadSuccess: (meta: EpubMetaData | null) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function EpubUploader({
  onUploadSuccess,
  onUploadError,
  className,
}: EpubUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    if (!file.name.endsWith(".epub")) {
      setToastMessage("请选择有效的EPUB文件");
      setToastType("error");
      setToastOpen(true);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setToastMessage(`文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      setToastType("error");
      setToastOpen(true);
      return false;
    }

    return true;
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!validateFile(file)) return;

      setLoading(true);
      setProgress(0);

      try {
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const epubId = await saveEpubData(file);
        clearInterval(progressInterval);
        setProgress(100);

        const meta = await getEpubMetadate(epubId);
        if (meta) {
          meta.hash = epubId;
          await saveEpubMetaData(epubId, meta);
          await saveEpubImage(epubId);
          onUploadSuccess(meta);
          setToastMessage(`${meta.title} 上传成功`);
          setToastType("success");
          setToastOpen(true);
        } else {
          throw new Error("Failed to process EPUB");
        }
      } catch (error) {
        console.error("Failed to process EPUB:", error);
        setToastMessage("文件上传失败，请重试");
        setToastType("error");
        setToastOpen(true);
        onUploadError?.(error as Error);
      } finally {
        setLoading(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [onUploadSuccess, onUploadError],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            上传中 ({progress}%)
          </>
        ) : (
          <>
            <svg
              className="-ml-1 mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            上传EPUB
          </>
        )}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".epub"
        className="hidden"
      />
      <Toast.Provider>
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
            toastType === "success"
              ? "bg-green-100 text-green-900"
              : "bg-red-100 text-red-900"
          }`}
        >
          <Toast.Title className="font-medium">{toastMessage}</Toast.Title>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 p-4" />
      </Toast.Provider>
    </div>
  );
}
