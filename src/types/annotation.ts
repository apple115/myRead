/**
 * 文本标注类型
 * - highlight: 高亮
 * - underline: 下划线
 * - mark: 标记
 */
export type TextType = "highlight" | "underline" | "mark";

/**
 * 文本选择标注接口
 */
export interface ITextSelection {
  /** 选中的文本内容 */
  text: string | null;
  /** EPUB CFI范围标识 */
  cfiRange: string;
  /** 创建时间 */
  createdAt: Date;
  /** 标注类型 */
  type: TextType;
  /** 可选笔记内容 */
  note?: string;
  /** 样式配置 */
  styles: Record<string, string>;
}
