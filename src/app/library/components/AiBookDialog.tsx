import React, { useEffect, useState } from "react";
import DialogRecord from "./DialogRecord";
import { Dialog } from "radix-ui";
import { ArrowUp } from "lucide-react";
import { loadEpubMetaData, loadEpubData } from "@/utils/epub";
import { uploadFileAndGetId, askAIWithFile } from "@/utils/ai";
import { Cross2Icon } from "@radix-ui/react-icons";

interface AiBookDialogProps {
  bookId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AiBookDialog({
  bookId,
  open,
  setOpen,
}: AiBookDialogProps) {
  //1 通过bookId 得到书本信息
  //2 通过bookId 查看是否有对话记录
  //3 通过bookId 上传书本
  //4 可以开始对话
  const [bookTitle, setBookTitle] = useState<string>("");

  async function getMetaData() {
    try {
      if (bookId.length == 0) {
        throw new Error("bookId为空");
      }
      const meta = await loadEpubMetaData(bookId);
      if (meta != null) {
        setBookTitle(meta.title);
      }
    } catch (error) {
      console.error("json数据加载失败:", error);
    }
  }

  async function getAiFileID(bookId: string): Promise<string | null> {
    try {
      const data = await loadEpubData(bookId);
      if (!data) {
        throw new Error("无法加载EPUB内容");
      }

      const blob = new Blob([data], { type: "application/epub+zip" });
      const file = new File([blob], `${bookId}.epub`, {
        type: "application/epub+zip",
      });
      const fileId = await uploadFileAndGetId(file);
      return fileId;
    } catch (error) {
      console.log("失败得到aifileId");
      return null;
    }
  }

  useEffect(() => {
    getMetaData();
  }, []);

  const fakeDialogs = [
    { role: "user", content: "这本书的主要内容是什么？" },
    { role: "ai", content: "这本书主要讲述了一些有趣的故事和知识。" },
    { role: "user", content: "有哪些关键人物？" },
    { role: "ai", content: "关键人物包括主角和一些配角。" },
  ];

  const [dialogs, setDialogs] =
    useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [userInput, setUserInput] = useState("");
  // 生成假数据

  const processQuestion = async (content: string) => {
    if (content.trim() === "") return;

    // 添加用户提问
    const newDialogs = [...dialogs, { role: "user" as const, content }];

    // const AiFileId = await getAiFileID(bookId);
    const AiFileId = "d03qe9eqvl73j296tc20"
    // 生成 AI 回复（后续需要替换为实际 API 调用）
    if (AiFileId != null) {
      const aiReply =await askAIWithFile(AiFileId, content);
      const updatedDialogs = [
        ...newDialogs,
        { role: "ai" as const, content: aiReply.content },
      ];
      // 更新对话记录并清空输入
      setDialogs(updatedDialogs);
    }else{
      const updatedDialogs = [
        ...newDialogs,
        { role: "ai" as const, content: "网络错误" },
      ];
      // 更新对话记录并清空输入
      setDialogs(updatedDialogs);
    }
    setUserInput("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    processQuestion(userInput);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 ">
          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray1 p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow bg-white">
            <Dialog.Title className="m-0 text-[17px] font-medium text-mauve12">
              书本对话
            </Dialog.Title>
            <Dialog.Description className="mb-5 text-[15px] leading-normal text-gray-700">
              &laquo;{bookTitle}&raquo;
            </Dialog.Description>
            <div>
              <DialogRecord dialogs={dialogs} />
              <div className="w-full ">
                <div className="flex space-x-4 m-2">
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-sm font-medium py-1 px-2 rounded"
                    onClick={() => processQuestion("书籍亮点")}
                  >
                    书籍亮点
                  </button>
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-sm font-medium py-1 px-2 rounded"
                    onClick={() => processQuestion("背景解读")}
                  >
                    背景解读
                  </button>
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-sm font-medium py-1 px-2 rounded"
                    onClick={() => processQuestion("关键概念")}
                  >
                    关键概念
                  </button>
                </div>
                <form
                  onSubmit={handleSubmit}
                  className="p-2 border rounded w-full"
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
            <Dialog.Close asChild>
              <button
                className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-violet11 bg-gray3 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
                aria-label="Close"
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
