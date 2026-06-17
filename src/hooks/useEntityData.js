import { useState, useCallback } from "react";
import { gqlRequest, buildListQuery, extractListFromData } from "../api/graphqlClient";

export function useEntityData(token, typeName, scalarFields) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastFetched, setLastFetched] = useState(null);

  const fetch = useCallback(async () => {
    if (!token || !typeName || !scalarFields?.length) return;
    setLoading(true);
    setError("");
    try {
      const query = buildListQuery(typeName, scalarFields);
      const res = await gqlRequest(token, query);
      setData(extractListFromData(res));
      setLastFetched(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, typeName, scalarFields]);

  const refresh = fetch;

  return { data, loading, error, lastFetched, fetch, refresh };
}
