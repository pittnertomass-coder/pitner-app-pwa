import { create } from "zustand";
import type { AudioTrack } from "@/types/database";

interface AudioSheetState {
  track: AudioTrack | null;
  isOpen: boolean;
  openAudio: (track: AudioTrack) => void;
  closeAudio: () => void;
}

export const useAudioSheetStore = create<AudioSheetState>((set) => ({
  track: null,
  isOpen: false,
  openAudio: (track) => set({ track, isOpen: true }),
  closeAudio: () => set({ isOpen: false }),
}));
