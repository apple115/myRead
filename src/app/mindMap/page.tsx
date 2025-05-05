"use client";
import React, { useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { getAiFileID, askAIWithFile } from "@/utils/ai";
import { ArrowLeft, Send } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

interface MindMapNode {
  id: string;
  data: {
    label: string;
  };
  position: {
    x: number;
    y: number;
  };
}

interface MindMapEdge {
  id: string;
  source: string;
  target: string;
}

interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export default function MindMapPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userInput, setUserInput] = useState<string>();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [bookId, setBookId] = useState<string>(
    searchParams.get("bookId") ?? "",
  );
  const [isLoading, setIsLoading] = useState(false);

  const extractJsonFromMarkdown = (markdown: string): string => {
    const regex = /```json\n([\s\S]*?)\n```/;
    const match = regex.exec(markdown);
    if (!match) {
      throw new Error("未找到有效的 JSON 代码块");
    }
    return match[1];
  };

  const generateMindMap = async (bookId: string): Promise<void> => {
    if (!bookId) {
      alert("请输入书籍ID");
      return;
    }
    setIsLoading(true);
    try {
      const aiFileId = await getAiFileID(bookId);
      if (aiFileId != null) {
        const question = `请根据这本书的内容生成一个结构化的思维导图数据。要求如下：
1. 中心节点应该是书名，位于坐标(0, 0)
2. 主要分支包含：
   - 故事梗概
   - 主要人物

3. 每个主要分支可以有2-3个子节点，描述具体内容, 子节点内容要简洁，不要超过100字,大于5个字
4. 节点坐标说明：
   - 主分支节点距离中心200-300像素
   - 子节点距离主分支节点150-200像素
   - 注意节点之间要有适当间距，避免重叠

请按照以下JSON格式返回数据：
{
  "nodes": [
    { "id": "1", "data": { "label": "书名" }, "position": { "x": 0, "y": 0 } },
    { "id": "2", "data": { "label": "主分支1" }, "position": { "x": 200, "y": 0 } },
    { "id": "3", "data": { "label": "子节点1" }, "position": { "x": 400, "y": 50 } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" },
    { "id": "e2-3", "source": "2", "target": "3" }
  ]
}

要求：
1. 确保生成的是合法的JSON格式
2. 节点id必须唯一
3. edges的id格式为'e' + source + '-' + target
4. 思维导图要简洁清晰，总节点数不超过20个
5. 思维导图的节点和边要符合JSON格式
6. ${userInput ? `用户期望的思维导图主题是：${userInput}，请围绕这个主题展开` : "请围绕书籍核心内容展开"}`;

        const response = await askAIWithFile(aiFileId, [], question);
        console.log("response", response);
        if (!response?.content) {
          throw new Error("AI没有返回有效的内容");
        }

        try {
          const jsonStr = extractJsonFromMarkdown(response.content);
          const cleanJson = jsonStr.replace(/\\"/g, '"');
          console.log("cleanJson", cleanJson);
          const data = JSON.parse(cleanJson) as MindMapData;
          setNodes(data.nodes);
          setEdges(data.edges);
        } catch (error) {
          console.error("Failed to parse AI response:", error);
        }
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="flex justify-between items-center p-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              router.back();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="返回"
          >
            <ArrowLeft className="text-gray-600" size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">思维导图生成器</h1>
        </div>
      </div>

      {/* 输入区域 */}
      <div className="flex items-center gap-4 p-4 bg-white border-b">
        <div className="flex-1 flex gap-4">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="输入书籍ID"
            value={bookId}
            onChange={(e) => {
              setBookId(e.target.value);
            }}
          />
          <input
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
            }}
            placeholder="输入您想要的思维导图主题（可选）"
          />
          <button
            onClick={() => {
              generateMindMap(bookId);
            }}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white shadow-sm`}
          >
            <Send size={16} className={isLoading ? "animate-pulse" : ""} />
            {isLoading ? "生成中..." : "生成思维导图"}
          </button>
        </div>
      </div>

      {/* 思维导图区域 */}
      <div className="flex w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          defaultEdgeOptions={{
            type: "smoothstep",
          }}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
