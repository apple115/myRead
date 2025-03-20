import { OpenAI } from "openai";
import { fetch } from "@tauri-apps/plugin-http";

interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 创建共享的OpenAI配置
function createKimiAi() {
  const apiKey = process.env.NEXT_PUBLIC_MOONSHOT_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_MOONSHOT_API_KEY environment variable",
    );
  }

  return new OpenAI({
    baseURL: "https://api.moonshot.cn/v1",
    apiKey,
    dangerouslyAllowBrowser: true,
    fetch:fetch,
  });
}

function createDeepSeekAi() {
  const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_KEY environment variable",
    );
  }
  return new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey,
    dangerouslyAllowBrowser: true,
    fetch:fetch,
  });
}

/**
 * 调用AI API的封装函数
 * @param prompt - 输入的文本提示
 * @returns 包含AI生成内容和用量的Promise
 * @throws 如果API调用失败或返回无效响应
 */
async function callAI(prompt: string): Promise<AIResponse> {
  try {
    const openai = createDeepSeekAi();
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error("AI response is empty");
    }

    return {
      content: completion.choices[0].message.content,
      usage: completion.usage,
    };
  } catch (error) {
    console.error("AI API call failed:", error);
    throw new Error("Failed to get AI response");
  }
}

/**
 * 使用文件内容向AI提问
 * @param file - 要发送的文件
 * @param question - 要问的问题
 * @returns 包含AI生成内容和用量的Promise
 * @throws 如果文件处理或API调用失败
 */
async function askAIWithFile(
  file: File,
  question: string,
): Promise<AIResponse> {
  try {
    const openai = createKimiAi();

    // 上传并处理文件
    const fileObject = await openai.files.create({
      file,
      purpose: "file-extract" as any, // 类型强制转换
    });

    const fileContent = await (
      await openai.files.content(fileObject.id)
    ).text();

    const messages = [
      {
        role: "system",
        content:
          "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。",
      },
      { role: "system", content: fileContent },
      { role: "user", content: question },
    ];

    // 获取AI响应
    const completion = await openai.chat.completions.create({
      model: "moonshot-v1-32k",
      messages: messages as any, // 类型强制转换
      temperature: 0.3,
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error("AI response is empty");
    }

    //TODO 清理添加的file

    return {
      content: completion.choices[0].message.content,
      usage: completion.usage,
    };
  } catch (error) {
    console.error("AI with file processing failed:", error);
    throw new Error("Failed to process file with AI");
  }
}

export { callAI, askAIWithFile, type AIResponse };
