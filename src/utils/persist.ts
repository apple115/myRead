import {
  BaseDirectory,
  mkdir,
  readTextFile,
  writeTextFile,
  remove,
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
// │   │   ├── {epub_id}.png         // 封面图片缓存
// │   ├── persist
// │   │   ├── {epub_id}.json         // Epub位置,书本设置什么的
// │   └── preferences.json          / 全局用户偏好设置
// ├── epub-data/
// │   ├── {epub_id}.epub            // EPUB 文件存储
// │   ├── {epub_id}.epub            // EPUB 文件存储
export interface Persist {
  location: string | null;
}

//确保目录存在
async function ensurePersistDir() {
  try {
    await mkdir("epub-reader-data/persist", {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });
  } catch (error) {
    console.error("创建PersistDir失败", error);
  }
}

async function savePersist(epubId: string, persist: Persist): Promise<void> {
  await ensurePersistDir();
  const filePath = `epub-reader-data/persist/${epubId}.json`;
  await writeTextFile(filePath, JSON.stringify(persist), {
    baseDir: BaseDirectory.AppData,
    create: true,
  });
}

async function loadPersist(epubId: string): Promise<Persist | null> {
  await ensurePersistDir();
  try {
    const filePath = `epub-reader-data/persist/${epubId}.json`;
    const data = await readTextFile(filePath, {
      baseDir: BaseDirectory.AppData,
    });
    console.log("epubId:", epubId);
    console.log("Persist:", data);
    return JSON.parse(data) as Persist;
  } catch (error) {
    console.error("加载Persist失败", error);
    return null;
  }
}

async function deletePersist(epubId: string): Promise<void> {
  try {
    const filePath = `epub-reader-data/persist/${epubId}.json`;
    await remove(filePath, {
      baseDir: BaseDirectory.AppData,
    });
  } catch (error) {
    console.error("删除Persist失败", error);
    throw error;
  }
}

export { savePersist, loadPersist, deletePersist };
