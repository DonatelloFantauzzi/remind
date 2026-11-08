import { create } from "zustand";
import request from "../../api/client.js";

export const useAuthStore = create((set) => ({
  user: null,
  checked: false,

  checkSession: async () => {
    let data;

    try {
      data = await request("/auth/me");
    } catch (error) {
      if (error.status !== 401) {
        console.error(error);
      }
      set({ user: null, checked: true });
      return;
    }

    set({ user: data.user, checked: true });
  },

  login: async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    set({ user: data.user });
  },

  logout: async () => {
    await request("/auth/logout", { method: "POST" });

    set({ user: null });
  },
}));
