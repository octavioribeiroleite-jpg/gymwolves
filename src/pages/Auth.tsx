import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar solicitação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4"
      style={{ background: '#0B0F14' }}
    >
      {/* Radial glow behind logo */}
      <div
        className="pointer-events-none absolute top-[10%] left-1/2 -translate-x-1/2 -translate-y-1/4"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, hsl(142 71% 45% / 0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        {/* Logo */}
        <img
          src={logo}
          alt="GYM WOVES"
          className="mb-3 h-56 w-56 object-contain"
          style={{ filter: 'drop-shadow(0 0 40px hsl(142 71% 45% / 0.25))' }}
        />

        {/* Title */}
        <h1
          className="text-[3.2rem] leading-none font-bold tracking-[0.08em] text-foreground"
          style={{
            fontFamily: "'Anton', sans-serif",
            textShadow: '0 0 30px hsl(142 71% 45% / 0.3), 0 4px 12px rgba(0,0,0,0.6)',
          }}
        >
          GYM WOVES
        </h1>

        {/* Slogan */}
        <p
          className="mt-2 text-xs font-medium tracking-[0.35em] uppercase"
          style={{ color: '#9CA3AF' }}
        >
          TREINE • EVOLUA • REPITA
        </p>

        {/* Form container */}
        <div
          className="mt-8 w-full rounded-3xl p-6"
          style={{
            background: 'rgba(31, 41, 55, 0.5)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={!isLogin}
                  className="h-13 rounded-2xl border-0 pl-11 text-sm"
                  style={{ background: '#1F2937', color: '#F3F4F6' }}
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-13 rounded-2xl border-0 pl-11 text-sm"
                style={{ background: '#1F2937', color: '#F3F4F6' }}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-13 rounded-2xl border-0 pl-11 text-sm"
                style={{ background: '#1F2937', color: '#F3F4F6' }}
              />
            </div>

            <Button
              type="submit"
              className="h-14 w-full rounded-2xl text-base font-bold uppercase tracking-widest"
              disabled={loading}
              style={{
                background: '#22C55E',
                color: '#fff',
                boxShadow: '0 0 24px hsl(142 71% 45% / 0.35), 0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "ENTRAR" : "CRIAR CONTA"}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm" style={{ color: '#D1D5DB' }}>
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold transition-colors hover:opacity-80"
              style={{ color: '#22C55E' }}
            >
              {isLogin ? "Criar conta" : "Fazer login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
