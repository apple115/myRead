import { useCallback } from 'react';
import { saveAnnotations, loadAnnotations } from '@/utils/annotations';
import type { ITextSelection } from '@/types/annotation';

export function useAnnotations() {
  const save = useCallback(async (bookId: string, annotations: ITextSelection[]) => {
    try {
      await saveAnnotations(bookId, annotations);
    } catch (error) {
      console.error('保存注释失败:', error);
      throw error;
    }
  }, []);

  const load = useCallback(async (bookId: string) => {
    try {
      return await loadAnnotations(bookId);
    } catch (error) {
      console.error('加载注释失败:', error);
      return [];
    }
  }, []);

  return {
    saveAnnotations: save,
    loadAnnotations: load,
  };
}
