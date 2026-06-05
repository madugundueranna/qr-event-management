import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { getFavoriteIds, toggleFavorite as apiToggle } from "../api/favoriteApi";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { isAuthenticated } = useAuth();
  // Set of eventId strings the current user has favorited
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  // Prevent duplicate in-flight toggles for the same event
  const pending = useRef(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      return;
    }
    setLoading(true);
    getFavoriteIds()
      .then((data) => {
        if (data?.ids) setFavoriteIds(new Set(data.ids));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const isFavorited = useCallback(
    (eventId) => favoriteIds.has(String(eventId)),
    [favoriteIds]
  );

  // Returns { favorited: boolean } or throws
  const toggle = useCallback(
    async (eventId) => {
      const id = String(eventId);
      if (pending.current.has(id)) return null;
      pending.current.add(id);

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });

      try {
        const data = await apiToggle(id);
        // Reconcile with server response
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (data.favorited) next.add(id);
          else next.delete(id);
          return next;
        });
        return data;
      } catch (err) {
        // Roll back optimistic update on error
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
        throw err;
      } finally {
        pending.current.delete(id);
      }
    },
    []
  );

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorited, toggle, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
