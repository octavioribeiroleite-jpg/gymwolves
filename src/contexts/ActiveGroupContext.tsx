import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ActiveGroupContextType {
  activeGroupId: string | null;
  setActiveGroupId: (id: string | null) => void;
}

const ActiveGroupContext = createContext<ActiveGroupContextType>({
  activeGroupId: null,
  setActiveGroupId: () => {},
});

export const useActiveGroup = () => useContext(ActiveGroupContext);

export const ActiveGroupProvider = ({ children }: { children: ReactNode }) => {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(() => {
    return localStorage.getItem("active_group_id");
  });

  useEffect(() => {
    if (activeGroupId) {
      localStorage.setItem("active_group_id", activeGroupId);
    } else {
      localStorage.removeItem("active_group_id");
    }
  }, [activeGroupId]);

  return (
    <ActiveGroupContext.Provider value={{ activeGroupId, setActiveGroupId }}>
      {children}
    </ActiveGroupContext.Provider>
  );
};
