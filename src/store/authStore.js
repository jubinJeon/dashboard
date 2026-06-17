import { useState, useCallback, useEffect } from "react";

const TOKEN_KEY = "srco_bearer_token";

export function useAuth() {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");

  const setToken = useCallback((t) => {
    setTokenState(t);
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  }, []);

  const clearToken = useCallback(() => {
    setTokenState("");
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  return { token, setToken, clearToken, isAuthenticated: !!token };
}
