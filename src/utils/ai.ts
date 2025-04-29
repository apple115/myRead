import { OpenAI } from "openai";
import { fetch } from "@tauri-apps/plugin-http";
import { loadSetting, type AiApiSettings } from "./setting";
import _ from "lodash";
import { loadPersist, updatePersist } from "./persist";
import { loadEpubData } from "./epub";

const modelToUrlMap = {
  "deepseek-chat": "https://api.deepseek.com/v1",
  "deepseek-r1": "https://api.deepseek.com/v1",
  "moonshot-v1-8k": "https://api.moonshot.cn/v1",
  "moonshot-v1-32k": "https://api.moonshot.cn/v1",
  "moonshot-v1-128k": "https://api.moonshot.cn/v1",
};

interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

// 系统消息列表
const systemMessages: Message[] = [
  {
    role: "system",
    content:
      "你是寄存在阅读器中人工智能助手，你更擅长中文和英文的对话，帮助读者理解书本，回答用户的问题。你会为用户提供安全，有帮助，准确回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。",
  },
  {
    role: "system",
    content: "使用markdown语法回答，同时使用中文回答",
  },
];

// 创建共享的OpenAI配置
async function createOpenAIInstance(model: string): Promise<OpenAI | null> {
  try {
    const setting = await loadSetting();
    const apiKey =
      setting?.AiApiSetting?.[
        model.includes("deepseek") ? "deepSeek" : "kimichat"
      ]?.key;
    if (!apiKey) {
      throw new Error(`Missing apiKey variable for ${model}`);
    }
    const baseURL = modelToUrlMap[model as keyof typeof modelToUrlMap];
    return new OpenAI({
      baseURL,
      apiKey,
      dangerouslyAllowBrowser: true,
      fetch: fetch,
    });
  } catch (error) {
    console.error(`Error loading ${model} AI settings:`, error);
    return null;
  }
}

/**
 * 生成包含系统消息和用户消息的消息列表
 * @param n 保留的最新消息数量，默认为 20
 * @returns 包含系统消息和用户消息的消息列表
 */
async function makeMessages(
  prevMessages: Message[] = [],
  n: number = 20,
): Promise<Message[]> {
  const newMessages = [...prevMessages];
  return newMessages.length > n
    ? [...systemMessages, ...newMessages.slice(-n)]
    : [...systemMessages, ...newMessages];
}

/**
 * 调用AI API的封装函数
 * @param prompt - 输入的文本提示
 * @returns 包含AI生成内容和用量的Promise
 * @throws 如果API调用失败或返回无效响应
 */
async function callAI(
  prompt: string,
  prevMessages: Message[] = [],
  model = "deepseek-chat",
): Promise<AIResponse> {
  try {
    const openai = await createOpenAIInstance(model);
    if (!openai) {
      throw new Error(`Failed to create OpenAI instance for ${model}`);
    }
    const messageList = await makeMessages(prevMessages);
    const completion = await openai.chat.completions.create({
      model,
      messages: messageList,
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI response is empty");
    }
    return {
      content,
      usage: completion.usage,
    };
  } catch (error) {
    console.error("AI API call failed:", error);
    throw new Error("Failed to get AI response");
  }
}

/**
 * 只使用一次的call AI函数，不保存历史消息
 * @param prompt - 输入的文本提示
 * @param model - 使用的模型名称
 * @returns 包含AI生成内容和用量的Promise
 * @throws 如果API调用失败或返回无效响应
 */
async function callAIOnce(
  prompt: string,
  model: string = "deepseek-chat",
): Promise<AIResponse> {
  try {
    const openai = await createOpenAIInstance(model);
    if (!openai) {
      throw new Error(`Failed to create OpenAI instance for ${model}`);
    }
    const singleMessageList = await makeMessages([]);
    const updatedMessageList = _.chain(singleMessageList)
      .concat(systemMessages, { role: "user", content: prompt })
      .value();
    const completion = await openai.chat.completions.create({
      model,
      //@ts-ignore
      messages: updatedMessageList,
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI response is empty");
    }
    return {
      content,
      usage: completion.usage,
    };
  } catch (error) {
    console.error("AI API call failed:", error);
    throw new Error("Failed to get AI response");
  }
}

// 上传文件并获取文件ID
async function uploadFileAndGetId(
  file: File,
  model: string = "moonshot-v1-8k",
): Promise<string | null> {
  try {
    const openai = await createOpenAIInstance(model);
    if (!openai) {
      throw new Error(`Failed to create OpenAI instance for ${model}`);
    }
    const fileObject = await openai.files.create({
      file,
      //@ts-ignore
      purpose: "file-extract",
    });
    return fileObject.id;
  } catch (error) {
    console.error("File upload failed:", error);
    return null;
  }
}

/**
 * 使用文件内容向AI提问
 * @param fileId - 要发送的文件
 * @param prevMessages - 
 * @param question - 要问的问题
 * @returns 包含AI生成内容和用量的Promise
 * @throws 如果文件处理或API调用失败
 */
async function askAIWithFile(
  fileId: string,
  prevMessages: Message[],
  question: string,
  model: string = "moonshot-v1-128k",
): Promise<AIResponse> {
  try {
    const openai = await createOpenAIInstance(model);
    if (!openai) {
      throw new Error(`Failed to create OpenAI instance for ${model}`);
    }
    const fileContent = await (await openai.files.content(fileId)).text();
    const messageList = await makeMessages(prevMessages);
    const updatedMessageList = _.chain(messageList)
      .concat(
        {
          role: "assistant",
          content: fileContent,
        },
        { role: "user", content: question },
      )
      .value();
    console.log("messageList", updatedMessageList);
    const completion = await openai.chat.completions.create({
      model,
      //@ts-ignore
      messages: updatedMessageList,
      temperature: 0.3,
      max_tokens: 4096,
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI response is empty");
    }
    // TODO: 清理添加的file
    return {
      content,
      usage: completion.usage,
    };
  } catch (error) {
    console.error("AI with file Id processing failed:", error);
    throw new Error("Failed to process file with AI using file id");
  }
}

async function getAiFileID(bookId: string): Promise<string | null> {
  try {
    // 如果Persist中有数据返回Persist
    const persist = await loadPersist(bookId);
    if (persist?.aiFileId != null) {
      return persist.aiFileId;
    } else {
      const data = await loadEpubData(bookId);
      if (!data) {
        throw new Error("无法加载EPUB内容");
      }

      const blob = new Blob([data], { type: "application/epub+zip" });
      const file = new File([blob], `${bookId}.epub`, {
        type: "application/epub+zip",
      });
      const fileId = await uploadFileAndGetId(file);
      if (fileId != null) {
        const newPersistData = {
          aiFileId: fileId,
        };
        await updatePersist(bookId, newPersistData);
      } else {
        throw new Error("fileId is null");
      }
      return fileId;
    }
  } catch (error) {
    console.log("失败得到aifileId");
    return null;
  }
}

export {
  callAI,
  callAIOnce,
  uploadFileAndGetId,
  askAIWithFile,
  getAiFileID,
  type AIResponse,
};
