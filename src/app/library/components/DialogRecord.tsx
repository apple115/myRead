import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Message } from "@/utils/ai";

interface DialogRecordProps {
  dialogs: Message[];
}

export default function DialogRecord({ dialogs }: DialogRecordProps) {
  return (
    <div className="p-2 mb-4 overflow-y-auto h-[500px]">
      {dialogs
        .filter((dialog) => dialog.role !== "assistant")
        .map((dialog, index) => {
          const uniqueId = Date.now().toString() + index.toString(); // 时间戳结合索引
          return (
            <div
              key={uniqueId}
              className={`mb-2 ${dialog.role === "user" ? "text-right" : "text-left"}`}
            >
              <strong
                className={`text-${dialog.role === "user" ? "blue-500" : "green-500"}`}
              >
                {dialog.role === "user" ? "你" : "AI"}:
              </strong>
              <div className="bg-gray-100 p-1 rounded">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {dialog.content}
                </Markdown>
              </div>
            </div>
          );
        })}
    </div>
  );
}
