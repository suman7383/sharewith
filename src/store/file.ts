import { FileProps } from "@/types";
import { create } from "zustand";

interface FileState {
  file: FileProps | null;
  setFile: (user: FileProps) => void;
}

export const useFileState = create<FileState>()((set) => ({
  file: null,
  setFile: (file) => set(() => ({ file })),
}));
