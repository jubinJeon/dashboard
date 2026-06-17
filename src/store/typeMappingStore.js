import { useState, useCallback } from "react";

const MAPPING_KEY = "srco_type_mapping";

const defaultMapping = { srType: "", coType: "" };

export function useTypeMapping() {
  const [mapping, setMappingState] = useState(() => {
    try {
      const saved = localStorage.getItem(MAPPING_KEY);
      return saved ? JSON.parse(saved) : defaultMapping;
    } catch {
      return defaultMapping;
    }
  });

  const setMapping = useCallback((next) => {
    setMappingState(next);
    localStorage.setItem(MAPPING_KEY, JSON.stringify(next));
  }, []);

  const clearMapping = useCallback(() => {
    setMappingState(defaultMapping);
    localStorage.removeItem(MAPPING_KEY);
  }, []);

  return { mapping, setMapping, clearMapping };
}
