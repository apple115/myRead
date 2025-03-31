export interface ITextSelection {
  text: string | null;
  cfiRange: string;
  createdAt: Date;
  type: string;
  note?: string;
}
