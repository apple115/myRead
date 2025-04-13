"use client";
import React, { useState } from "react";
import ApiSetting from "./components/ApiSetting";
import { AIApiSetting } from "@/types/aiApi";
import { loadSetting, updateSetting } from "@/utils/setting";
import Link from "next/link";

export default function SettingsPage() {
  const [activeSetting, setActiveSetting] = useState("ai-api"); // 初始显示 AI API 设置

  // 处理 DeepSeek 保存
  const handleDeepseekSave = async (data: AIApiSetting) => {
    try {
      // 1. 获取当前设置
      const currentSetting = await loadSetting();
      // 2. 创建新的 AI 设置数组（如果当前不存在则初始化空数组）
      const newAiSettings = [...(currentSetting?.AiApiSetting || []), data];
      // 3. 调用 updateSetting 更新配置
      await updateSetting({
        AiApiSetting: newAiSettings,
      });
      console.log("DeepSeek 设置已保存:", data);
    } catch (error) {
      console.error("保存失败:", error);
    }
  };

  // 处理 KimiChat 保存
  const handleKimichatSave = (data: AIApiSetting) => {
    console.log("KimiChat 设置已保存:", data);
    // 这里可添加实际保存逻辑（如存本地存储或发请求）
  };

  // 处理本地设置保存
  const handleLocalSave = (data: AIApiSetting) => {
    console.log("本地设置已保存:", data);
    // 这里可添加实际保存逻辑（如存本地存储或发请求）
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4 flex">
      <div className="w-64 p-4">
        <h2 className="text-lg font-semibold mb-4">设置选项</h2>
        <div
          className={`mb-2 cursor-pointer ${activeSetting === "ai-api" ? "text-blue-500" : ""}`}
          onClick={() => setActiveSetting("ai-api")}
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
            />
            <ApiSetting
              title="kimichat api 设置"
              modelOptions={["kimichat-v1", "kimichat-pro"]}
              keyPlaceholder="输入你的 kimichat API key"
            />
            <ApiSetting title="本地api设置" hasUrl={true} />
          </>
        )}
        {/* {activeSetting === 'other-setting' && (
          <div>其他设置内容</div>
        )} */}
      </div>
    </div>
  );
}
