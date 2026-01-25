import { useState, useEffect } from "react";
import type { AuthResponse } from "../services/authApi";
import { loadAuthUser } from "../services/authApi";

export function useAuth() {
  const [user, setUser] = useState<AuthResponse | null>(() => loadAuthUser());

  useEffect(() => {
    // Simple local cache watcher: poll localStorage changes occasionally.
    // For fuller integration (Firebase) you'd subscribe to auth state.
    const id = setInterval(() => {
      const current = loadAuthUser();
      setUser((prev) => {
        const prevId = prev?.userId ?? null;
        const curId = current?.userId ?? null;
        if (prevId !== curId) return current;
        return prev;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const isAuthenticated = !!user && !!user.userId;
  const role = (user?.typeName ?? "").toUpperCase();
  const isManager = role === "MANAGER";

  return { user, isAuthenticated, role, isManager, refresh: () => setUser(loadAuthUser()) };
}
