import type { AIApiSetting } from "@/types/aiApi";
import React, { useEffect, useState } from "react";

interface ApiSettingProps {
  title: string; // 标题
  modelLabel?: string; // 模型标签
  keyLabel?: string; // key 标签
  modelOptions?: string[]; // 模型选项
  keyPlaceholder?: string; // 输入对应的 API key
  hasUrl?: boolean; // 预留扩展标记
  onSave?: (data: AIApiSetting) => void; // 保存按钮的回调函数
  onloadData?: AIApiSetting;
}

export default function ApiSetting({
  title,
  modelLabel = "模型",
  keyLabel = "key",
  modelOptions = [],
  keyPlaceholder = "输入对应的 API key",
  hasUrl = false,
  onSave,
  onloadData,
}: ApiSettingProps) {
  const [model, setModel] = useState("");
  const [key, setKey] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (onloadData) {
      if (hasUrl) {
        setUrl(onloadData.url ?? "");
        setModel(onloadData.model);
      } else {
        setModel(onloadData.model);
        setKey(onloadData.key ?? "");
      }
    }
  }, [onloadData, hasUrl]);

  const handleSave = () => {
    if (hasUrl) {
      onSave?.({ url, model }); // 本地模型调用
    } else {
      onSave?.({ model, key }); // 远程模型调用
    }
  };

  return (
    <div className="p-4 mb-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {!hasUrl && (
        <div className="mb-4">
          <label
            htmlFor="model-select"
            className="block text-sm font-medium mb-1"
          >
            {modelLabel}
          </label>
          <select
            id="model-select"
            className="w-full form-select"
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
            }}
          >
            <option>选择模型</option>
            {modelOptions.map((option) => {
              return <option key={option}>{option}</option>;
            })}
          </select>
        </div>
      )}
      {hasUrl ? (
        <>
          <div className="mb-4">
            <label
              htmlFor="url-input"
              className="block text-sm font-medium mb-1"
            >
              url
            </label>
            <input
              id="url-input"
              type="text"
              className="w-full form-input"
              placeholder="输入本地 API 地址"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
              }}
            />
          </div>
          <div>
            <label
              htmlFor="model-input"
              className="block text-sm font-medium mb-1"
            >
              模型
            </label>
            <input
              id="model-input"
              type="text"
              className="w-full form-input"
              placeholder="输入本地模型名称"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
              }}
            />
          </div>
        </>
      ) : (
        <div>
          <label htmlFor="key-input" className="block text-sm font-medium mb-1">
            {keyLabel}
          </label>
          <input
            id="key-input"
            type="text"
            className="w-full form-input"
            placeholder={keyPlaceholder}
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
            }}
          />
        </div>
      )}
      <button
        type="button"
        className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
        onClick={handleSave}
      >
        更新
      </button>
    </div>
  );
}
