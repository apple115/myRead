import type { AIApiSetting } from "@/types/aiApi";
import {
  BaseDirectory,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import _ from "lodash";

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
// │   │   ├── {epub_id}.png         / 持续的
// │   ├── setting.json //存储ai什么api 什么的
// │   └── preferences.json          / 全局用户偏好设置
// ├── epub-data/
// │   ├── {epub_id}.epub            // EPUB 文件存储
// │   ├── {epub_id}.epub            // EPUB 文件存储

export interface Setting {
  AiApiSetting: AiApiSettings;
}

export interface AiApiSettings {
  deepSeek?: AIApiSetting;
  kimichat?: AIApiSetting;
  local?: AIApiSetting;
}

async function ensureSettingDir() {
  try {
    await mkdir("epub-reader-data", {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });
  } catch (error) {
    console.error("创建设置文件失败:", error);
  }
}

async function saveSetting(setting: Setting): Promise<void> {
  await ensureSettingDir();
  const filePath = "epub-reader-data/setting.json";
  await writeTextFile(filePath, JSON.stringify(setting), {
    baseDir: BaseDirectory.AppData,
    create: true,
  });
}

async function loadSetting(): Promise<Setting | null> {
  await ensureSettingDir();
  try {
    const filePath = "epub-reader-data/setting.json";
    const data = await readTextFile(filePath, {
      baseDir: BaseDirectory.AppData,
    });
    console.log("配置文件", data);
    return JSON.parse(data) as Setting;
  } catch (error) {
    console.error("加载设置文件失败:", error);
    return null;
  }
}

async function updateSetting(newSetting: Partial<Setting>): Promise<void> {
  const currentSetting = await loadSetting();
  // 合并当前设置与新设置，若当前设置不存在则使用默认空数组
  const updatedSetting = _.merge({}, currentSetting, newSetting);
  await saveSetting(updatedSetting as Setting);
}

export { saveSetting, loadSetting, updateSetting };
