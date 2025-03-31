export type TextType = "highlight" | "underline" | "mark"
export interface ITextSelection {
  text: string | null;
  cfiRange: string;
  createdAt: Date;
  type: TextType;
  note?: string;
  styles: object;
}
