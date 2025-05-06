import { type Persist, loadPersist, savePersist } from "@/utils/persist";
import { useCallback } from "react";

export function usePersist() {
  const save = useCallback(async (bookId: string, persist: Persist) => {
    try {
      await savePersist(bookId, persist);
    } catch (error) {
      console.error("保存注释失败:", error);
      throw error;
    }
  }, []);

  const load = useCallback(async (bookId: string) => {
    try {
      return await loadPersist(bookId);
    } catch (error) {
      console.error("加载注释失败:", error);
      return null;
    }
  }, []);

  return {
    savePersist: save,
    loadPersist: load,
  };
}
