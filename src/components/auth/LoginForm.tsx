import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Mail, Lock, Zap, ArrowRight, Sparkles, Shield, BookOpen, Users, Wallet, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth';
import { useTheme } from '@/hooks/useTheme';

// Dev quick access profiles - bypass login for development
const DEV_PROFILES = [
  { role: 'ADMIN' as UserRole, label: 'Admin', icon: Shield, color: 'from-red-500 to-red-600' },
  { role: 'DIRETORIA' as UserRole, label: 'Diretoria', icon: GraduationCap, color: 'from-primary to-primary-dark' },
  { role: 'SECRETARIA' as UserRole, label: 'Secretaria', icon: Users, color: 'from-blue-500 to-blue-600' },
  { role: 'FINANCEIRO' as UserRole, label: 'Financeiro', icon: Wallet, color: 'from-teal-500 to-teal-600' },
  { role: 'PROFESSOR' as UserRole, label: 'Professor', icon: BookOpen, color: 'from-amber-500 to-amber-600' },
  { role: 'ENCARREGADO' as UserRole, label: 'Encarregado', icon: Users, color: 'from-purple-500 to-purple-600' },
];

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(true);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const { login, isLoading, devBypassLogin } = useAuth();
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      await login({ email, password });
      toast({
        title: "Bem-vindo ao SiGER!",
        description: "Login realizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error?.message || "Credenciais inválidas.",
        variant: "destructive",
      });
    }
  };

  const handleDevQuickAccess = (profile: typeof DEV_PROFILES[0]) => {
    devBypassLogin(profile.role);
    toast({
      title: `Acesso como ${profile.label}`,
      description: "Modo de desenvolvimento ativo!",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary">
          {/* Decorative circles */}
          <motion.div 
            className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 right-20 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-2xl"
            animate={{ 
              y: [-20, 20, -20],
            }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">SiGER</h1>
                <p className="text-white/70 text-sm">Sistema de Gestão Escolar</p>
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Transforme a gestão
              <br />
              <span className="text-primary-light">da sua escola</span>
            </h2>

            <p className="text-lg text-white/80 mb-8 max-w-md">
              Plataforma completa para escolas moçambicanas. 
              Matrículas, notas, presenças e finanças num só lugar.
            </p>

            <div className="space-y-4">
              {[
                'Pauta Digital conforme MINEDH',
                'Controlo financeiro em MZN',
                'Relatórios automáticos',
              ].map((feature, i) => (
                <motion.div 
                  key={feature}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="text-white/90">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom wave decoration */}
        <svg 
          className="absolute bottom-0 left-0 right-0" 
          viewBox="0 0 1440 120" 
          fill="none"
        >
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="white" 
            fillOpacity="0.05"
          />
        </svg>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="absolute top-4 right-4 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDark ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </motion.div>
        </Button>

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <motion.div 
            className="lg:hidden flex items-center justify-center gap-3 mb-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">SiGER</h1>
              <p className="text-xs text-muted-foreground">Gestão Escolar</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-muted-foreground mb-8">
              Entre na sua conta para continuar
            </p>
          </motion.div>

          {/* Dev Quick Login */}
          <AnimatePresence mode="wait">
            {showDevPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">Acesso Rápido (Dev)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setShowDevPanel(false)}
                    >
                      Ocultar
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {DEV_PROFILES.map((profile) => {
                      const IconComponent = profile.icon;
                      return (
                        <motion.button
                          key={profile.role}
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleDevQuickAccess(profile)}
                          onMouseEnter={() => setIsHovered(profile.role)}
                          onMouseLeave={() => setIsHovered(null)}
                          className={`
                            relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200
                            ${isHovered === profile.role 
                              ? 'border-primary bg-primary/10 shadow-md scale-[1.02]' 
                              : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
                            }
                          `}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${profile.color} flex items-center justify-center shadow-sm`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs font-medium text-foreground">{profile.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Acesso directo para teste — sem autenticação
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showDevPanel && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mb-6 text-xs text-muted-foreground"
              onClick={() => setShowDevPanel(true)}
            >
              <Zap className="w-3 h-3 mr-1" /> Mostrar Acesso Rápido
            </Button>
          )}

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">
                ou entre com email
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.mz"
                  className="pl-11 h-12 bg-background border-border focus:border-primary focus:ring-primary/20"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Palavra-passe
                </Label>
                <button 
                  type="button"
                  className="text-xs text-primary hover:underline"
                >
                  Esqueceu?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a sua palavra-passe"
                  className="pl-11 pr-11 h-12 bg-background border-border focus:border-primary focus:ring-primary/20"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary-dark text-primary-foreground font-medium transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Contacte a administração
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-muted-foreground/60">
            © 2025 SiGER - Sistema de Gestão Escolar Reviva
            <br />
            Feito com ❤️ em Moçambique
          </p>
        </div>
      </motion.div>
    </div>
  );
}
