"use client";
import { ReactReader } from "react-reader";
import { useState } from "react";

interface EpubReaderProps {
  file: Uint8Array;
  meta?: {
    title: string;
    author: string;
    description?: string;
  };
  onLocationChange?: (location: string) => void;
}

export function EpubReader({ file, meta, onLocationChange }: EpubReaderProps) {
  const [location, setLocation] = useState<string | null>(null);

  const handleLocationChange = (loc: string) => {
    setLocation(loc);
    onLocationChange?.(loc);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {meta && (
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">{meta.title}</h2>
          <p className="text-gray-600 mt-1">Author: {meta.author}</p>
          {meta.description && (
            <p className="text-gray-600 mt-1 text-sm">{meta.description}</p>
          )}
        </div>
      )}

      <div className="flex-1 h-[80vh]">
        <ReactReader
          url={file?.buffer}
          location={location}
          locationChanged={handleLocationChange}
        />
      </div>
    </div>
  );
}
