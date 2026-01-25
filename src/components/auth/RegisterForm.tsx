import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Mail, Lock, User, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/types/auth';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('PROFESSOR');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationAttempts, setRegistrationAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState<Date | null>(null);
  const { register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check cooldown period
    if (cooldownUntil && new Date() < cooldownUntil) {
      const remainingSeconds = Math.ceil((cooldownUntil.getTime() - new Date().getTime()) / 1000);
      toast({
        title: "Aguarde",
        description: `Por favor, aguarde ${remainingSeconds} segundo(s) antes de tentar novamente.`,
        variant: "destructive",
      });
      return;
    }
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As palavras-passe não coincidem.",
        variant: "destructive",
      });
      return;
    }

    // Requisitos fortes de palavra-passe para protecção de dados escolares
    if (password.length < 10) {
      toast({
        title: "Palavra-passe muito curta",
        description: "A palavra-passe deve ter pelo menos 10 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast({
        title: "Palavra-passe fraca",
        description: "A palavra-passe deve conter pelo menos uma letra maiúscula.",
        variant: "destructive",
      });
      return;
    }

    if (!/[a-z]/.test(password)) {
      toast({
        title: "Palavra-passe fraca",
        description: "A palavra-passe deve conter pelo menos uma letra minúscula.",
        variant: "destructive",
      });
      return;
    }

    if (!/[0-9]/.test(password)) {
      toast({
        title: "Palavra-passe fraca",
        description: "A palavra-passe deve conter pelo menos um número.",
        variant: "destructive",
      });
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      toast({
        title: "Palavra-passe fraca",
        description: "A palavra-passe deve conter pelo menos um caractere especial (!@#$%^&*).",
        variant: "destructive",
      });
      return;
    }

    try {
      await register({ name, email, password, role });
      setRegistrationAttempts(0);
      setCooldownUntil(null);
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique o seu email para confirmar a conta.",
        variant: "default",
      });
    } catch (error: any) {
      const newAttempts = registrationAttempts + 1;
      setRegistrationAttempts(newAttempts);
      
      // Exponential backoff: 30s, 60s, 120s
      if (newAttempts >= 3) {
        const cooldownSeconds = Math.min(30 * Math.pow(2, newAttempts - 3), 300);
        const cooldownTime = new Date(Date.now() + cooldownSeconds * 1000);
        setCooldownUntil(cooldownTime);
      }
      
      toast({
        title: "Erro no registo",
        description: error.message || "Erro ao criar conta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="surface-card shadow-xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Criar Conta - SGE REVIVA
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sistema de Gestão Escolar - Moçambique
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Nome Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="O seu nome completo"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-foreground">
                  Função
                </Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Seleccione a sua função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DIRETORIA">Diretoria</SelectItem>
                      <SelectItem value="SECRETARIA">Secretária</SelectItem>
                      <SelectItem value="FINANCEIRO">Financeiro</SelectItem>
                      <SelectItem value="PROFESSOR">Professor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Palavra-passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mín. 10 caracteres, maiúsculas, números e especiais"
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirmar Palavra-passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a sua palavra-passe"
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-hero"
                disabled={isLoading || (cooldownUntil !== null && new Date() < cooldownUntil)}
              >
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <button 
                  className="text-primary hover:underline font-medium"
                  onClick={() => window.location.href = '/login'}
                >
                  Fazer login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}