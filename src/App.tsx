import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ActiveChallengeProvider } from "@/contexts/ActiveChallengeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ChallengeList from "./pages/ChallengeList";
import CreateChallenge from "./pages/CreateChallenge";
import JoinChallenge from "./pages/JoinChallenge";
import InviteScreen from "./pages/InviteScreen";
import ChallengeDetails from "./pages/ChallengeDetails";
import History from "./pages/History";
import Ranking from "./pages/Ranking";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import PwaInstallPrompt from "./components/PwaInstallPrompt";

const queryClient = new QueryClient();

const App = () => {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashFinish = useCallback(() => setSplashDone(true), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
        {splashDone && <PwaInstallPrompt />}
        <BrowserRouter>
          <AuthProvider>
            <ActiveChallengeProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/desafios" element={<ProtectedRoute><ChallengeList /></ProtectedRoute>} />
                <Route path="/desafios/criar" element={<ProtectedRoute><CreateChallenge /></ProtectedRoute>} />
                <Route path="/desafios/entrar" element={<ProtectedRoute><JoinChallenge /></ProtectedRoute>} />
                <Route path="/desafios/:id/convidar" element={<ProtectedRoute><InviteScreen /></ProtectedRoute>} />
                <Route path="/desafios/:id/detalhes" element={<ProtectedRoute><ChallengeDetails /></ProtectedRoute>} />
                <Route path="/historico" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
                <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ActiveChallengeProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
