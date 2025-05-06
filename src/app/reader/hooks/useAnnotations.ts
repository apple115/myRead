import type { ITextSelection } from "@/types/annotation";
import { loadAnnotations, saveAnnotations } from "@/utils/annotations";
import { useCallback } from "react";

export function useAnnotations() {
  const save = useCallback(
    async (bookId: string, annotations: ITextSelection[]) => {
      try {
        await saveAnnotations(bookId, annotations);
      } catch (error) {
        console.error("保存注释失败:", error);
        throw error;
      }
    },
    [],
  );

  const load = useCallback(async (bookId: string) => {
    try {
      return await loadAnnotations(bookId);
    } catch (error) {
      console.error("加载注释失败:", error);
      return [];
    }
  }, []);

  return {
    saveAnnotations: save,
    loadAnnotations: load,
  };
}
