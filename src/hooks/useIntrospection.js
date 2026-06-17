import { useState, useCallback } from "react";
import { gqlRequest, INTROSPECTION_QUERY, resolveTypeName } from "../api/graphqlClient";

export function useIntrospection(token) {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const run = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await gqlRequest(token, INTROSPECTION_QUERY);
      setTypes(data.__schema.types);
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const reset = useCallback(() => {
    setTypes([]);
    setDone(false);
    setError("");
  }, []);

  const userTypes = types.filter(
    (t) => t.kind === "OBJECT" && !t.name.startsWith("__") && t.fields?.length
  );

  const getScalarFields = useCallback(
    (typeName) => {
      const SCALARS = ["String", "Int", "Float", "Boolean", "ID"];
      const t = types.find((x) => x.name === typeName);
      if (!t) return [];
      return t.fields
        .filter((f) => SCALARS.includes(resolveTypeName(f.type)))
        .map((f) => f.name)
        .slice(0, 25);
    },
    [types]
  );

  const guessType = useCallback(
    (keywords) =>
      userTypes.find((t) => keywords.some((k) => t.name.toLowerCase().includes(k)))?.name ?? "",
    [userTypes]
  );

  return { types, userTypes, loading, error, done, run, reset, getScalarFields, guessType };
}
