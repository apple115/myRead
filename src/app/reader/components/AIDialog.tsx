import { Dialog } from "radix-ui";
import { callAIOnce } from "@/utils/ai";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import React, { useState } from "react";
import { ArrowUp } from "lucide-react";

interface AIInputOutputProps {
  text: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function AIInputOutput({ text, isOpen, setIsOpen }: AIInputOutputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const askAI = async () => {
    setIsLoading(true);
    try {
      const usertext = `input,对于这段话${text}`;
      const result = await callAIOnce(usertext);
      setOutput(result.content);
    } catch (error) {
      console.error("调用 AI 出错:", error);
      setOutput("调用 AI 时出现错误，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    askAI().catch((error:unknown) => {
      console.error("askAI", error);
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="">
          <Dialog.Content className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Dialog.Title className="text-xl font-bold">AI 交互</Dialog.Title>
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Close asChild>
                  <button className="text-gray-500 hover:text-gray-700">
                    &times;
                  </button>
                </Dialog.Close>
              </div>
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-gray-800">{text}</p>
              </div>
              <div className="flex justify-between items-center border border-gray-300 rounded">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                  }}
                  placeholder="请输入问题"
                  className=" p-2 w-full"
                />
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || input === ""}
                  className="mr-2"
                >
                  <ArrowUp size={16} className="" />
                </button>
              </div>
              <div className="min-h-[200px] max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse">AI正在思考中，请稍候...</div>
                  </div>
                ) : output ? (
                  <div className="bg-gray-100 p-1 rounded">
                    <Markdown remarkPlugins={[remarkGfm]}>{output}</Markdown>
                  </div>
                ) : (
                  <div className="text-gray-500 p-2">暂无输出</div>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
