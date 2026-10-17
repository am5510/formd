"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ProgressContextType {
  answeredCount: number;
  totalQuestions: number;
  progressPercent: number;
  updateProgress: (answered: number, total: number) => void;
}

const ProgressContext = createContext<ProgressContextType>({
  answeredCount: 0,
  totalQuestions: 20,
  progressPercent: 0,
  updateProgress: () => {},
});

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(20);

  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const updateProgress = useCallback((answered: number, total: number) => {
    setAnsweredCount(answered);
    setTotalQuestions(total);
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        answeredCount,
        totalQuestions,
        progressPercent,
        updateProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export const useEvaluationProgress = () => useContext(ProgressContext);
