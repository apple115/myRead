import React, { useEffect, useState } from "react";
import DialogRecord from "./DialogRecord";
import { Dialog } from "radix-ui";
import { ArrowUp } from "lucide-react";
import { loadEpubMetaData } from "@/utils/epub";
import { Cross2Icon } from "@radix-ui/react-icons";

interface AiBookDialogProps {
  bookId: string;
  open:boolean
  setOpen: (open: boolean) => void;
}

export default function AiBookDialog({ bookId ,open,setOpen}: AiBookDialogProps) {
  //1 通过bookId 得到书本信息
  //2 通过bookId 查看是否有对话记录
  //3 通过bookId 上传书本
  //4 可以开始对话
  const [bookTitle, setBookTitle] = useState<string>("");

  async function getMetaData() {
    console.log("你好");
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
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 ">
          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray1 p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow bg-white">
            <Dialog.Title className="m-0 text-[17px] font-medium text-mauve12">
              书本对话
            </Dialog.Title>
            <Dialog.Description className="mb-5 mt-2.5 text-[15px] leading-normal text-mauve11">
              {bookTitle}
            </Dialog.Description>
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
