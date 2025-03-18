"use client";
import { useCallback, useState, useRef } from "react";
import { saveEpubData, getEpubMetadate, saveEpubMetaData } from "@/utils/epub";
import { Toast } from "radix-ui";
import type { EpubMetaData } from "@/utils/epub";

interface EpubUploaderProps {
  onUploadSuccess: (meta: EpubMetaData | null) => void;
  onUploadError?: (error: Error) => void;
  id?: string;
  className?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function EpubUploader({
  onUploadSuccess,
  onUploadError,
  id,
  className,
}: EpubUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isDragging, setIsDragging] = useState(false);
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex gap-2">
        <div
          onClick={handleClick}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all ${
            loading
              ? "opacity-50 pointer-events-none"
              : isDragging
                ? "bg-blue-50 border-blue-500"
                : "hover:bg-gray-50"
          } ${className}`}
        >
          <div className="text-center">
            <svg
              className={`mx-auto h-12 w-12 ${
                isDragging ? "text-blue-500" : "text-gray-400"
              } transition-colors`}
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
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-semibold">点击上传或拖放EPUB文件</p>
              <p className="text-xs text-gray-500 mt-1">
                支持 .epub 文件，最大50MB
              </p>
            </div>
          </div>
          {loading && (
            <div className="w-full mt-4">
              <div className="bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                上传中... {progress}%
              </p>
            </div>
          )}
        </div>
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
    </div>
  );
}
