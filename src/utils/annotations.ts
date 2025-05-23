import {
  BaseDirectory,
  mkdir,
  readTextFile,
  remove,
  writeTextFile,
  exists,
} from "@tauri-apps/plugin-fs";
import type { ITextSelection } from "../types/annotation";

// ${appData}
// ├── epub-reader-data/
// │   ├── metadata/
// │   │   ├── {epub_id}.json        // EPUB 元数据（标题、作者、目录结构等）
// │   ├── bookmarks/
// │   │   ├── {epub_id}.json        // 书签数据（按 EPUB 文件存储）
// │   ├── annotations/
// │   │   ├── {epub_id}.json        // 批注数据（按 EPUB 文件存储）
// │   ├── covers/
// │   │   ├── {epub_id}.png         / 封面图片缓存
// │   └── preferences.json          / 全局用户偏好设置
// ├── epub-data/
// │   ├── {epub_id}.epub            // EPUB 文件存储
// │   ├── {epub_id}.epub            // EPUB 文件存储

// 确保目录存在
async function ensureAnnotationsDir() {
  try {
    await mkdir("epub-reader-data/annotations", {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });
  } catch (error) {
    console.error("创建注释目录失败:", error);
  }
}

// 保存注释
async function saveAnnotations(
  epubId: string,
  annotations: ITextSelection[],
): Promise<void> {
  const filePath = `epub-reader-data/annotations/${epubId}.json`;
  await writeTextFile(filePath, JSON.stringify(annotations), {
    baseDir: BaseDirectory.AppData,
    create: true,
  });
}

// 加载注释
async function loadAnnotations(epubId: string): Promise<ITextSelection[]> {
  await ensureAnnotationsDir();
  try {
    const filePath = `epub-reader-data/annotations/${epubId}.json`;
    if (await exists(filePath, { baseDir: BaseDirectory.AppData })) {
      const data = await readTextFile(filePath, {
        baseDir: BaseDirectory.AppData,
      });
      return JSON.parse(data) as ITextSelection[];
    }
    return [];
  } catch (error) {
    console.error("Failed to load annotations:", error);
    return [];
  }
}

// 删除注释文件
async function deleteAnnotations(epubId: string): Promise<void> {
  try {
    const filePath = `epub-reader-data/annotations/${epubId}.json`;
    // 检查文件是否存在
    if (await exists(filePath, { baseDir: BaseDirectory.AppData })) {
      // 删除存在的文件
      await remove(filePath, { baseDir: BaseDirectory.AppData });
    }
  } catch (error) {
    console.error("Failed to delete annotations:", error);
    throw error;
  }
}

export { saveAnnotations, loadAnnotations, deleteAnnotations };
