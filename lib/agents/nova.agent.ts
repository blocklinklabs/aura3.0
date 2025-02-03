"use client";

import { create } from "zustand";

interface NovaState {
  isAnalyzing: boolean;
  currentContext: {
    userMood: number;
    stressLevel: number;
    recentActivities: string[];
    lastInteraction: Date;
  };
  suggestions: Array<{
    type: "environment" | "activity" | "intervention" | "medical";
    priority: number;
    content: string;
    reason: string;
    timestamp: Date;
  }>;
  riskLevel: "low" | "medium" | "high";
}

interface NovaActions {
  analyzeMood: (mood: number, note?: string) => Promise<void>;
  suggestIntervention: () => Promise<void>;
  handleCrisis: () => Promise<void>;
  adjustEnvironment: () => Promise<void>;
}

export const useNovaAgent = create<NovaState & NovaActions>((set, get) => ({
  isAnalyzing: false,
  currentContext: {
    userMood: 50,
    stressLevel: 0,
    recentActivities: [],
    lastInteraction: new Date(),
  },
  suggestions: [],
  riskLevel: "low",

  analyzeMood: async (mood: number, note?: string) => {
    set({ isAnalyzing: true });

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newSuggestions = [];

    // Example autonomous decision making
    if (mood < 30) {
      newSuggestions.push({
        type: "intervention",
        priority: 1,
        content: "Would you like to try a quick breathing exercise?",
        reason: "Your mood appears lower than usual",
        timestamp: new Date(),
      });

      // Adjust environment for low mood
      newSuggestions.push({
        type: "environment",
        priority: 2,
        content:
          "I've adjusted the lighting to a warmer tone to help lift your mood",
        reason: "Environmental factors can impact emotional well-being",
        timestamp: new Date(),
      });
    }

    set((state) => ({
      isAnalyzing: false,
      suggestions: [...state.suggestions, ...newSuggestions],
      currentContext: {
        ...state.currentContext,
        userMood: mood,
        lastInteraction: new Date(),
      },
    }));
  },

  suggestIntervention: async () => {
    const { currentContext } = get();

    // AI decides on appropriate intervention based on context
    const intervention = {
      type: "activity",
      priority: 2,
      content:
        "Based on your recent activity patterns, a short walk might help refresh your mind",
      reason: "Physical activity can help improve mood and reduce stress",
      timestamp: new Date(),
    };

    set((state) => ({
      suggestions: [...state.suggestions, intervention],
    }));
  },

  handleCrisis: async () => {
    set({ riskLevel: "high" });

    // AI crisis intervention protocol
    const crisisIntervention = {
      type: "intervention",
      priority: 1,
      content:
        "I've noticed signs of distress. Would you like to speak with a crisis counselor?",
      reason: "Immediate support may be helpful",
      timestamp: new Date(),
    };

    set((state) => ({
      suggestions: [crisisIntervention, ...state.suggestions],
    }));
  },

  adjustEnvironment: async () => {
    const { currentContext } = get();

    // AI environmental optimization
    const adjustment = {
      type: "environment",
      priority: 3,
      content: "I've optimized your environment for better focus and calm",
      reason: "Environmental factors can significantly impact well-being",
      timestamp: new Date(),
    };

    set((state) => ({
      suggestions: [...state.suggestions, adjustment],
    }));
  },
}));
