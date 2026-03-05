import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ActiveChallengeContextType {
  activeChallengeId: string | null;
  setActiveChallengeId: (id: string | null) => void;
}

const ActiveChallengeContext = createContext<ActiveChallengeContextType>({
  activeChallengeId: null,
  setActiveChallengeId: () => {},
});

export const useActiveChallenge = () => useContext(ActiveChallengeContext);

export const ActiveChallengeProvider = ({ children }: { children: ReactNode }) => {
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(() => {
    return localStorage.getItem("active_challenge_id");
  });

  useEffect(() => {
    if (activeChallengeId) {
      localStorage.setItem("active_challenge_id", activeChallengeId);
    } else {
      localStorage.removeItem("active_challenge_id");
    }
  }, [activeChallengeId]);

  return (
    <ActiveChallengeContext.Provider value={{ activeChallengeId, setActiveChallengeId }}>
      {children}
    </ActiveChallengeContext.Provider>
  );
};
