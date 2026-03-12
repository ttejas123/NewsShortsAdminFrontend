import { User } from "../types/api";

export const getCurrentUser = (): User | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    return null;
};