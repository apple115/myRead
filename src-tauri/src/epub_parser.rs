use roxmltree::Document;

// 找到 text 中所有的 p 元素文本内容，返回一个包含这些文本的 Vec
fn get_all_p_elemnt(text: &str) -> Vec<String> {
  // 解析传入的 XHTML 文本
  let doc = match Document::parse(text) {
    Ok(doc) => doc,
    Err(_) => return vec![], // 解析失败则返回空向量
  };

  // 查找所有 <p> 元素
  let p_elements = doc.descendants().filter(|n| n.tag_name().name() == "p");

  // 提取每个 <p> 元素的文本内容
  let mut result = Vec::new();
  for p in p_elements {
    if let Some(text) = p.text() {
      result.push(text.to_string()); // 将 &str 转换为 String
    }
  }
  result
}

//测试
#[cfg(test)]
mod tests {
  use std::{fs::File, io::Read, path::PathBuf};

  use crate::epub_parser::get_all_p_elemnt;

  #[test]
  fn test_get_all_p_element() {
    let path =
      PathBuf::from("/Users/apple115/Downloads/alicezip/OEBPS/890231480751205683_11-h-2.htm.xhtml");
    // 读取文件内容
    let mut file = match File::open(&path) {
      Ok(file) => file,
      Err(e) => {
        eprintln!("Failed to open file: {}", e);
        return;
      }
    };
    let mut content = String::new();
    if let Err(e) = file.read_to_string(&mut content) {
      eprintln!("Failed to read file: {}", e);
      return;
    }
    // 提取所有 <p> 元素的文本内容
    let p_texts = get_all_p_elemnt(&content);
    // 输出提取结果
    for (index, text) in p_texts.iter().enumerate() {
      println!("Paragraph {}: {}", index + 1, text);
    }
    // 可以根据实际情况添加断言进行验证
    assert!(p_texts.is_empty(), "No <p> elements found in the file.");
  }
}
