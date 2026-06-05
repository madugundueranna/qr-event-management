// src/context/AppContext.jsx

import { createContext, useContext, useMemo, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [userRole, setUserRole] = useState("buyer");
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);

  const toggleWishlist = (property) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === property.id);
      if (exists) return prev.filter((item) => item.id !== property.id);
      return [...prev, property];
    });
  };

  const toggleCompare = (property) => {
    setCompareList((prev) => {
      const exists = prev.some((item) => item.id === property.id);
      if (exists) return prev.filter((item) => item.id !== property.id);
      if (prev.length >= 4) return prev;
      return [...prev, property];
    });
  };

  const value = useMemo(
    () => ({
      userRole,
      setUserRole,
      wishlist,
      compareList,
      toggleWishlist,
      toggleCompare,
    }),
    [userRole, wishlist, compareList]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
