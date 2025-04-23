import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DialogRecordProps {
  dialogs: { role: "user" | "ai"; content: string }[];
}

export default function DialogRecord({ dialogs }: DialogRecordProps) {
  return (
    <div className="p-2 mb-4 overflow-y-auto h-[500px]">
      {dialogs.map((dialog, index) => (
        <div
          key={index}
          className={`mb-2 ${dialog.role === "user" ? "text-right" : "text-left"}`}
        >
          <strong
            className={`text-${dialog.role === "user" ? "blue-500" : "green-500"}`}
          >
            {dialog.role === "user" ? "你" : "AI"}:
          </strong>
          <div className="bg-gray-100 p-1 rounded">
            <Markdown remarkPlugins={[remarkGfm]}>{dialog.content}</Markdown>
          </div>
        </div>
      ))}
    </div>
  );
}
