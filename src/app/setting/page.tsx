"use client";
import type { AIApiSetting } from "@/types/aiApi";
import { loadSetting, updateSetting } from "@/utils/setting";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import ApiSetting from "./components/ApiSetting";

export default function SettingsPage() {
  const [activeSetting, setActiveSetting] = useState("ai-api"); // 初始显示 AI API 设置
  const [deepseekApi, setDeepseekApi] = useState<AIApiSetting>();
  const [kimichatApi, setKimichatApi] = useState<AIApiSetting>();
  const [localApi, setLocalApi] = useState<AIApiSetting>();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await loadSetting();
        if (settings?.AiApiSetting) {
          setDeepseekApi(settings.AiApiSetting.deepSeek);
          setKimichatApi(settings.AiApiSetting.kimichat);
          setLocalApi(settings.AiApiSetting.local);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("加载设置失败:", error.message);
        } else {
          console.error("加载设置失败:", error);
        }
      }
    };
    fetchSettings().catch((error: unknown) => {
      // 这里可以添加额外的错误处理逻辑
      console.error("fetchSettings 函数出现错误:", error);
    });
  }, []);

  // 处理 DeepSeek 保存
  const handleDeepseekSave = async (data: AIApiSetting) => {
    try {
      const newAiSettings = {
        AiApiSetting: {
          deepSeek: data,
        },
      };
      // 3. 调用 updateSetting 更新配置
      await updateSetting(newAiSettings);
      console.log("DeepSeek 设置已保存:", data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("保存失败:", error.message);
      } else {
        console.error("保存失败:", error);
      }
    }
  };

  // 处理 DeepSeek 保存
  const handleKimichatSave = async (data: AIApiSetting) => {
    try {
      const newAiSettings = {
        AiApiSetting: {
          kimichat: data,
        },
      };
      // 3. 调用 updateSetting 更新配置
      await updateSetting(newAiSettings);
      console.log("DeepSeek 设置已保存:", data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("保存失败:", error.message);
      } else {
        console.error("保存失败:", error);
      }
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4 flex">
      <div className="w-64 p-4">
        <h2 className="text-lg font-semibold mb-4">设置选项</h2>
        <div
          className={`mb-2 cursor-pointer ${activeSetting === "ai-api" ? "text-blue-500" : ""}`}
          onClick={() => {
            setActiveSetting("ai-api");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setActiveSetting("ai-api");
            }
          }}
        >
          AI API 设置
        </div>
        {/* 其他设置选项示例（可扩展） */}
        {/* <div
          className={`mb-2 cursor-pointer ${activeSetting === 'other-setting'? 'text-blue-500' : ''}`}
          onClick={() => setActiveSetting('other-setting')}
        >
          其他设置
        </div> */}
      </div>
      <div className="flex-1 p-4">
        {activeSetting === "ai-api" && (
          <>
            <div className="justify-between items-center mb-4 flex">
              <h1 className="text-2xl font-bold mb-4">AI API 设置</h1>
              <Link
                href="/library"
                className="p-2 text-blue-600 hover:text-blue-800"
              >
                返回书架 →
              </Link>
            </div>
            <ApiSetting
              title="deepseek api 设置"
              modelOptions={["deepseek-r1", "deepseek-chat"]}
              keyPlaceholder="输入你的 deepseek API key"
              onSave={void handleDeepseekSave}
              onloadData={deepseekApi}
            />
            <ApiSetting
              title="kimichat api 设置"
              modelOptions={[
                "moonshot-v1-8k",
                "moonshot-v1-32k",
                "moonshot-v1-128k",
              ]}
              keyPlaceholder="输入你的 kimichat API key"
              onSave={void handleKimichatSave}
              onloadData={kimichatApi}
            />
            <ApiSetting
              title="本地api设置"
              hasUrl={true}
              onloadData={localApi}
            />
          </>
        )}
        {/* {activeSetting === 'other-setting' && (
          <div>其他设置内容</div>
        )} */}
      </div>
    </div>
  );
}
