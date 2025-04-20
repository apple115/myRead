import React, { useState } from "react";
import DialogRecord from "./DialogRecord";
import { ArrowUp } from "lucide-react";

interface AiBookDialogProps {
  bookTitle: string;
}

export default function AiBookDialog({ bookTitle }: AiBookDialogProps) {
  const fakeDialogs = [
    { role: "user", content: "这本书的主要内容是什么？" },
    { role: "ai", content: "这本书主要讲述了一些有趣的故事和知识。" },
    { role: "user", content: "有哪些关键人物？" },
    { role: "ai", content: "关键人物包括主角和一些配角。" },
  ];
  const [dialogs, setDialogs] =
    useState<{ role: "user" | "ai"; content: string }[]>(fakeDialogs);
  const [userInput, setUserInput] = useState("");
  // 生成假数据

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userInput.trim() === "") return;
    // 模拟用户输入记录
    const newDialogs = [...dialogs, { role: "user", content: userInput }];
    // 模拟 AI 响应，实际应调用 API 获取真实响应
    const aiReply = `这是关于《${bookTitle}》对 ${userInput} 的回复`;
    const updatedDialogs = [...newDialogs, { role: "ai", content: aiReply }];
    setDialogs(updatedDialogs);
    setUserInput("");
    // 后续可添加保存对话内容逻辑
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex justify-center items-center z-50"
      onclose={() => {}}
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl max-h-4xl w-3/4 h-3/4 relative">
        <div className="flex justify-center items-center">
          <div className="pt-2">
            <div className="text-lg font-bold ">AI 书本对话</div>
            <div className="text-xs ">《{bookTitle}》</div>
          </div>
        </div>
        <div className="p-4">
          <DialogRecord dialogs={dialogs} />
        </div>
        <div className="absolute bottom-0 w-full m-4">
          <div className="">
            <div className="flex space-x-4 m-2">
              <button className="bg-gray-200 hover:bg-gray-300 text-sm font-medium py-1 px-2 rounded">
                书籍亮点
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-sm font-medium py-1 px-2 rounded">
                背景解读
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-sm font-medium py-1 px-2 rounded">
                关键概念
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="m-1 p-2 border rounded w-3/4"
            >
              <div className="flex justify-between items-center ">
                <input
                  placeholder={`针对《${bookTitle}》提出你的问题`}
                  className="w-full"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <button type="submit">
                  <ArrowUp size={16} className="" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
