import { UserProps } from "@/types";
import { create } from "zustand";

interface UserState {
  user: UserProps | null;
  setUser: (user: UserProps) => void;
}

export const useUserState = create<UserState>()((set) => ({
  user: null,
  setUser: (user) => set(() => ({ user })),
}));
