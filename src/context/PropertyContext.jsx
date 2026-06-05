// src/context/PropertyContext.jsx

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getEvents } from "../api/eventApi";

const PropertyContext = createContext(null);

export function PropertyProvider({ children }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProperties = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEvents(params);
      setProperties(res.data || []);
    } catch (err) {
      setError("Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ properties, loading, error, fetchProperties }),
    [properties, loading, error, fetchProperties]
  );

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export const useProperties = () => useContext(PropertyContext);
