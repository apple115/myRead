import {
  readTextFile,
  writeTextFile,
  mkdir,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import _ from "lodash";
import type { Message } from "./ai";

// ├── epub-reader-data/
// │   ├── metadata/
// │   │   ├── {epub_id}.json        // EPUB 元数据（标题、作者、目录结构等）
// │   ├── bookmarks/
// │   │   ├── {epub_id}.json        // 书签数据（按 EPUB 文件存储）
// │   ├── annotations/
// │   │   ├── {epub_id}.json        // 批注数据（按 EPUB 文件存储）
// │   ├── covers/
// │   │   ├── {epub_id}.png         / 封面图片缓存
// │   ├── persist/
// │   │   ├── {epub_id}.json        / 持续的
// │   ├── ai-dialog/
// │   │   ├── {epub_id}.json        / 持续的
// │   ├── setting.json //存储ai什么api 什么的
// │   └── preferences.json          / 全局用户偏好设置
// ├── epub-data/
// │   ├── {epub_id}.epub            // EPUB 文件存储
// │   ├── {epub_id}.epub            // EPUB 文件存储

async function ensureAiDialogDir() {
  try {
    await mkdir("epub-reader-data/ai-dialog", {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });
  } catch (error) {
    console.error("创建ai-dialog文件失败:", error);
  }
}

async function saveAiDialog(
  epubId: string,
  messages: Message[],
): Promise<void> {
  await ensureAiDialogDir();
  const filePath = `epub-reader-data/ai-dialog/${epubId}.json`;
  await writeTextFile(filePath, JSON.stringify(messages), {
    baseDir: BaseDirectory.AppData,
    create: true,
  });
}

async function loadAiDialog(epubId: string): Promise<Message[] | null> {
  await ensureAiDialogDir();
  try {
    const filePath = `epub-reader-data/ai-dialog/${epubId}.json`;
    const data = await readTextFile(filePath, {
      baseDir: BaseDirectory.AppData,
    });
    return JSON.parse(data) as Message[];
  } catch (error) {
    console.error("加载ai-dialog数据失败:", error);
    return null;
  }
}

async function updateAiDialog(
  epubId: string,
  newMessages: Message[],
): Promise<void> {
  const currentMessages = await loadAiDialog(epubId);
  const updateMessages = _.merge({}, currentMessages, newMessages);
  await saveAiDialog(epubId, updateMessages);
}

async function deleteAiDialog(epubId: string): Promise<void> {
  try {
    const filePath = `epub-reader-data/ai-dialog/${epubId}.json`;
    await writeTextFile(filePath, "", {
      baseDir: BaseDirectory.AppData,
    });
  } catch (error) {
    console.error("删除ai-dialog数据失败:", error);
  }
}

export { saveAiDialog, loadAiDialog, deleteAiDialog, updateAiDialog };
