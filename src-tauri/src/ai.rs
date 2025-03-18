use async_openai::{
  config::OpenAIConfig,
  types::{ChatCompletionRequestUserMessageArgs, CreateChatCompletionRequestArgs},
  Client,
};
use std::error::Error;

pub async fn ask(prompt: String) -> Result<String, Box<dyn Error>> {
  let config = OpenAIConfig::default()
    .with_api_base("https://api.deepseek.com")
    .with_api_key(std::env::var("DEEPSEEK_API_KEY").expect("Missing DEEPSEEK_API_KEY"));
  let client = Client::with_config(config);

  let request = CreateChatCompletionRequestArgs::default()
    .model("deepseek-chat")
    .messages([ChatCompletionRequestUserMessageArgs::default()
      .content(prompt)
      .build()?
      .into()])
    .build()?;
  let response = client.chat().create(request).await?;
  // 打印响应提示信息
  println!("\nResponse (single):\n");

  // 从响应中提取第一个选择的文本
  let answer = response
    .choices
    .first()
    .and_then(|choice| choice.message.content.clone())
    .ok_or_else(|| {
      let err: Box<dyn Error> = "No vaild answer found in the API response".into();
      err
    })?;
  Ok(answer)
}

#[cfg(test)]
mod tests {
  use super::*;
  #[tokio::test]
  async fn test_real_api_call() {
    if let Ok(__api_key) = std::env::var("DEEPSEEK_API_KEY") {
      let result = ask("世界上最高峰是什么？".to_string()).await;
      match result {
        Ok(v) => {
          eprintln!("\nTest Passed:{}", v);
          assert!(
            v.contains("珠穆朗玛峰"),
            "Expected answer to contain '珠穆朗玛峰', but got: {}",
            v
          );
        }
        Err(e) => {
          eprintln!("API 请求失败: {}", e);
          assert!(false, "API 请求失败");
        }
      }
    } else {
      eprintln!("Skipping test: DEEPSEEK_API_KEY not set");
    }
  }
}
