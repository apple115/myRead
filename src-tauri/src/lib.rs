// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use epub::doc::EpubDoc;
use sha2::{Digest, Sha256};
use std::path::PathBuf;

#[derive(serde::Serialize)]
struct EpubMeta {
  title: String,
  author: String,
}
//生成epub文件的独一无二的id
#[tauri::command]
fn generate_unique_id(file_content: Vec<u8>) -> String {
  let mut hasher = Sha256::new();
  hasher.update(file_content);
  format!("{:x}", hasher.finalize())
}

#[tauri::command]
fn get_epub_meta(path: PathBuf) -> Result<EpubMeta, String> {
  let doc = EpubDoc::new(&path).map_err(|e| e.to_string())?;
  // Get basic metadata
  let title = doc.mdata("title").unwrap_or("Untitled".to_string());
  let author = doc.mdata("creator").unwrap_or("Unknown".to_string());

  Ok(EpubMeta { title, author })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![get_epub_meta, generate_unique_id])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
