import React from "react";

interface DialogRecordProps {
  dialogs: { role: "user" | "ai"; content: string }[];
}

export default function DialogRecord({ dialogs }: DialogRecordProps) {
  return (
    <div className="p-2 mb-4 overflow-y-auto h-[500px]" >
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
            <p className="text-gray-700 inline-block bg-gray-100 p-1 rounded">
              {dialog.content}
            </p>
          </div>
        ))}
      </div>
  );
}
