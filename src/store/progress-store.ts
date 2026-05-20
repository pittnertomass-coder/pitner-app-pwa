import { create } from "zustand";
import type { UserProgress, UserAudioProgress } from "@/types/database";

interface ProgressState {
  videoProgress: Record<string, UserProgress>;
  audioProgress: Record<string, UserAudioProgress>;
  setVideoProgress: (trainingId: string, progress: UserProgress) => void;
  setAudioProgress: (trackId: string, progress: UserAudioProgress) => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  videoProgress: {},
  audioProgress: {},
  setVideoProgress: (trainingId, progress) =>
    set((state) => ({
      videoProgress: { ...state.videoProgress, [trainingId]: progress },
    })),
  setAudioProgress: (trackId, progress) =>
    set((state) => ({
      audioProgress: { ...state.audioProgress, [trackId]: progress },
    })),
  reset: () => set({ videoProgress: {}, audioProgress: {} }),
}));
