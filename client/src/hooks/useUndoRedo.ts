import { useState, useCallback } from 'react';
import { Column } from '../types';

interface HistoryState {
  columns: Column[];
  timestamp: number;
}

export const useUndoRedo = (initialColumns: Column[]) => {
  const [history, setHistory] = useState<HistoryState[]>([{
    columns: initialColumns,
    timestamp: Date.now()
  }]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex];

  const saveState = useCallback((columns: Column[]) => {
    const newState: HistoryState = {
      columns: JSON.parse(JSON.stringify(columns)), // Deep clone
      timestamp: Date.now()
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newState);
      
      // Limit history to 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1].columns;
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1].columns;
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    currentState: currentState?.columns || initialColumns,
    saveState,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
