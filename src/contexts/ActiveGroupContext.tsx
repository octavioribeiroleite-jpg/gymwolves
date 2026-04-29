import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  // Auto-clear active group if it has been finished
  useEffect(() => {
    if (!activeGroupId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("groups")
        .select("status")
        .eq("id", activeGroupId)
        .maybeSingle();
      if (!cancelled && data && (data as any).status === "finished") {
        setActiveGroupId(null);
      }
    })();
    return () => { cancelled = true; };
  }, [activeGroupId]);

  return (
    <ActiveGroupContext.Provider value={{ activeGroupId, setActiveGroupId }}>
      {children}
    </ActiveGroupContext.Provider>
  );
};
