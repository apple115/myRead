
export interface Reader {
  bookId: string;
  initialMeta: {
    title: string;
    author: string;
    description?: string;
  };
}
