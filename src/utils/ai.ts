interface AIConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  APIKEY?: string;
  APIURL?: string;
}

interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface APIError extends Error {
  status?: number;
  code?: string;
}

/**
 * 调用AI API的封装函数
 * @param prompt -输入的文本提示
 * @param config - 配置选项
 * @returns 包括AI生成的内容和用量的Promise
 */
async function callAI(
  prompt: string,
  config: AIConfig = {},
): Promise<AIResponse> {
  const {
    model = "deepseek-chat",
    temperature = 0.7,
    maxTokens = 1000,
    APIKEY,
    APIURL = "https://api.deepseek.com/chat/completions",
  } = config;

  if (!APIKEY) {
    throw new Error("Missing AI API key");
  }

  try {
    const response = await fetch(APIURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
        Authorization: `Bearer ${APIKEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature,
        maxTokens: maxTokens,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      const errorData = data as {
        error?: { message?: string; code?: string };
      };
      const error: APIError = new Error(
        errorData.error?.message ||
          `API request failed with status ${response.status}`,
      );
      error.status = response.status;
      error.code = errorData.error?.code;
      throw error;
    }

    const responseData = data as {
      choices: Array<{ message: { content: string } }>;
      usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
    };
    return {
      content: responseData.choices[0].message.content.trim(),
      usage: responseData.usage,
    };
  } catch (error) {
    console.error("AI API call failed:", error);
    if (error instanceof Error) {
      throw new Error(`AI service error: ${error.message}`);
    }
    throw new Error("Unknown AI service error");
  }
}

export { callAI };
