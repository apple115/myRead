import { invoke } from "@tauri-apps/api/core";
import { appDataDir } from "@tauri-apps/api/path";
import {
  BaseDirectory,
  exists,
  mkdir,
  readFile,
  readTextFile,
  writeFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

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

interface EpubMetaData {
  title: string;
  author: string;
  description?: string;
}

// 初始化应用数据目录结构
async function initAppData() {
  try {
    //如果AppData目录不存在，则创建
    const appData = await appDataDir();
    await mkdir(`${appData}/epub-reader-data/metadata`, {
      recursive: true,
    });
    await mkdir(`${appData}/epub-reader-data/bookmarks`, {
      recursive: true,
    });
    await mkdir(`${appData}/epub-reader-data/annotations`, {
      recursive: true,
    });
    await mkdir(`${appData}/epub-reader-data/covers`, {
      recursive: true,
    });
    await mkdir(`${appData}/epub-data`, {
      recursive: true,
    });
  } catch (error) {
    console.error("Failed to initialize app data directories:", error);
    throw error;
  }
}
// 读取EPUB的metadata
async function getEpubMetadate(path:string):Promise<EpubMetaData>{
  const epub = await invoke<EpubMetaData>("get_epub_meta", {
    path:path,
  });
  return epub;
};
// 生成唯一ID
async function generateEpubId(file:File): Promise<string> {
    // 将arrayBuffer转化为uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const EpubId = await invoke<string>("generate_unique_id", {
        fileContent: new Uint8Array(arrayBuffer),
    });
    return EpubId;
}

// 保存EPUB文件到本地
async function saveEpubData(file:File): Promise<string> {
  await initAppData();

  // 将arrayBuffer转化为uint8Array
  const arrayBuffer = await file.arrayBuffer();
  const uniqueId = await invoke<string>("generate_unique_id", {
    fileContent: new Uint8Array(arrayBuffer),
  });

  // 保存文件
  const filePath = `epub-data/${uniqueId}.epub`;
  await writeFile(filePath, new Uint8Array(arrayBuffer), {
    baseDir: BaseDirectory.AppData,
    create: true,
  });

  return uniqueId;
}

// 加载EPUB文件
async function loadEpubData(epubId: string): Promise<Uint8Array> {
  const filePath = `epub-data/${epubId}.epub`;
  const data = await readFile(filePath, {
    baseDir: BaseDirectory.AppData,
  });
  return data;
}

// 保存EPUB元数据
async function saveEpubMetaData(epubId:string,meta: EpubMetaData): Promise<void> {
  const filePath = `epub-reader-data/metadata/${epubId}.json`;
  await writeTextFile(filePath, JSON.stringify(meta), {
    baseDir: BaseDirectory.AppData,
  });
}

// 加载EPUB元数据
async function loadEpubMetaData(epubId: string): Promise<EpubMetaData | null> {
  try {
    const filePath = `epub-reader-data/metadata/${epubId}.json`;
    const data = await readTextFile(filePath, {
      baseDir: BaseDirectory.AppData,
    });
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load EPUB metadata:", error);
    return null;
  }
}

// 获取所有EPUB文件的元数据
async function getAllEpubMetaData(): Promise<EpubMetaData[]> {
  try {
    // 这里需要实现读取metadata目录下所有文件的功能
    // 由于Tauri的fs API限制，可能需要使用invoke调用Rust端实现
    const metas = await invoke<EpubMetaData[]>("get_all_epub_meta");
    return metas;
  } catch (error) {
    console.error("Failed to get all EPUB metadata:", error);
    return [];
  }
}

export {
  initAppData,
  saveEpubData,
  loadEpubData,
  saveEpubMetaData,
  loadEpubMetaData,
  getAllEpubMetaData,
  getEpubMetadate
};
export type { EpubMetaData };
