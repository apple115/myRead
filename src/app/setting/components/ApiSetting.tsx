import React, { useState } from "react";
import type { AIApiSetting } from "@/types/aiApi";

interface ApiSettingProps {
  title: string; // 标题
  modelLabel?: string; // 模型标签
  keyLabel?: string; // key 标签
  modelOptions?: string[]; // 模型选项
  keyPlaceholder?: string; // 输入对应的 API key
  hasUrl?: boolean; // 预留扩展标记
  onSave?: (data: AIApiSetting) => void; // 保存按钮的回调函数
}

export default function ApiSetting({
  title,
  modelLabel = "模型",
  keyLabel = "key",
  modelOptions = [],
  keyPlaceholder = "输入对应的 API key",
  hasUrl = false,
  onSave,
}: ApiSettingProps) {
  const [model, setModel] = useState("");
  const [key, setKey] = useState("");
  const [url, setUrl] = useState("");

  const handleSave = () => {
    if (hasUrl) {
      onSave?.({url,model}); // 本地模型调用
    } else {
      onSave?.({ model, key }); // 远程模型调用
    }
  };

  return (
    <div className="p-4 mb-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {!hasUrl && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{modelLabel}</label>
          <select
            className="w-full form-select"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option>选择模型</option>
            {modelOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      )}
      {hasUrl ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">url</label>
            <input
              type="text"
              className="w-full form-input"
              placeholder="输入本地 API 地址"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">模型</label>
            <input
              type="text"
              className="w-full form-input"
              placeholder="输入本地模型名称"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
        </>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-1">{keyLabel}</label>
          <input
            type="text"
            className="w-full form-input"
            placeholder={keyPlaceholder}
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>
      )}
      <button
        className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
        onClick={handleSave}
      >
        更新
      </button>
    </div>
  );
}
