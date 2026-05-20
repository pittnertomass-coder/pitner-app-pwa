import { create } from "zustand";
import type { Training, UserProgress } from "@/types/database";

interface VideoState {
  training: Training | null;
  progress: UserProgress | null;
  isOpen: boolean;
  openVideo: (training: Training, progress?: UserProgress | null) => void;
  closeVideo: () => void;
  updateProgress: (progress: UserProgress) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  training: null,
  progress: null,
  isOpen: false,
  openVideo: (training, progress = null) =>
    set({ training, progress, isOpen: true }),
  closeVideo: () => set({ isOpen: false }),
  updateProgress: (progress) => set({ progress }),
}));
