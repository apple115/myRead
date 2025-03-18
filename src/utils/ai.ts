import { OpenAI } from "openai";
import { fetch } from "@tauri-apps/plugin-http";

/**
 * 调用AI API的封装函数
 * @param prompt -输入的文本提示
 * @param config - 配置选项
 * @returns 包括AI生成的内容和用量的Promise
 */
async function callAI(prompt: string): Promise<string | null> {
  const openai = new OpenAI({
    // baseURL: "https://api.deepseek.com",
    // apiKey: process.env.NEXT_PUBLIC_AI_API_KEY,
    baseURL: "https://api.moonshot.cn/v1",
    apiKey: "sk-gVkpfaoTRyciAaSKjo2VLw8pqyjz2429T8Rt6mK1eeettwqb",
    dangerouslyAllowBrowser: true,
    fetch:fetch
  });

  const conpletion = await openai.chat.completions.create({
    // model: "deepseek-chat",
    model:"moonshot-v1-8k",
    messages: [{ role: "user", content: prompt }],
  });
  return conpletion.choices[0].message.content;
}

/**
 * 使用文件内容向AI提问
 * @param file - 要发送的文件
 * @param question - 要问的问题
 * @returns AI的回答
 */
async function askAIWithFile(
  file: File,
  question: string,
): Promise<string | null> {
  const openai = new OpenAI({
    baseURL: "https://api.moonshot.cn/v1",
    apiKey: process.env.NEXT_PUBLIC_MOONSHOT_API_KEY,
    dangerouslyAllowBrowser: true,
    fetch: fetch,
  });

  let file_object = await openai.files.create({
    file: file,
    //@ts-ignore
    purpose: "file-extract",
  });
  let file_content = await (await openai.files.content(file_object.id)).text();

  // 把它放进请求中
  let messages = [
    {
      role: "system",
      content:
        "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。",
    },
    {
      role: "system",
      content: file_content,
    },
    { role: "user", content: question },
  ];

  const completion = await openai.chat.completions.create({
    model: "moonshot-v1-32k",
    //@ts-ignore
    messages: messages,
    temperature: 0.3,
  });
  return completion.choices[0].message.content;
}

export { callAI, askAIWithFile };
