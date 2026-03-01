import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Mail, Lock, User, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useParams, useNavigate, Link } from 'react-router-dom';

interface InvitationData {
  id: string;
  email: string | null;
  intended_role: string;
  intended_name: string | null;
  is_valid: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  DIRETORIA: 'Diretoria',
  SECRETARIA: 'Secretária',
  FINANCEIRO: 'Financeiro',
  PROFESSOR: 'Professor',
  PEDAGOGICO: 'Pedagógico',
  ENCARREGADO: 'Encarregado',
  ALUNO: 'Aluno',
};

export function InviteRegisterForm() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [validating, setValidating] = useState(true);
  const [invalid, setInvalid] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function validateToken() {
      if (!token) { setInvalid(true); setValidating(false); return; }
      
      const { data, error } = await supabase.rpc('validate_invitation', { _token: token });
      
      if (error || !data || data.length === 0) {
        setInvalid(true);
        setValidating(false);
        return;
      }

      const inv = data[0] as unknown as InvitationData;
      if (!inv.is_valid) {
        setInvalid(true);
        setValidating(false);
        return;
      }

      setInvitation(inv);
      if (inv.email) setEmail(inv.email);
      if (inv.intended_name) setName(inv.intended_name);
      setValidating(false);
    }
    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Erro", description: "As palavras-passe não coincidem.", variant: "destructive" });
      return;
    }

    if (password.length < 10) {
      toast({ title: "Palavra-passe muito curta", description: "Mínimo 10 caracteres.", variant: "destructive" });
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      toast({ title: "Palavra-passe fraca", description: "Deve conter maiúsculas, minúsculas, números e caracteres especiais.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: name,
            role: invitation?.intended_role || 'ALUNO',
          }
        }
      });

      if (signUpError) throw signUpError;

      // Consumir o convite
      if (token && signUpData.user) {
        await supabase.rpc('consume_invitation', { 
          _token: token, 
          _user_id: signUpData.user.id 
        });
      }

      setSuccess(true);
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique o seu email para confirmar a conta.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no registo",
        description: error.message || "Erro ao criar conta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Estado de carregamento
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">A validar o convite...</p>
        </motion.div>
      </div>
    );
  }

  // Convite inválido ou expirado
  if (invalid || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Convite Inválido</h2>
          <p className="text-muted-foreground mb-6">
            Este link de registo é inválido, já foi utilizado ou expirou.
            Contacte a administração da escola para obter um novo convite.
          </p>
          <Button asChild>
            <Link to="/login">Ir para Login</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  // Sucesso
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Conta Criada!</h2>
          <p className="text-muted-foreground mb-6">
            A sua conta foi criada com sucesso. Verifique o seu email para confirmar e depois faça login.
          </p>
          <Button asChild>
            <Link to="/login">Ir para Login</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border">
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
                Registo por Convite
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                SiGER - Sistema de Gestão Escolar Reviva
              </CardDescription>
            </div>

            <Badge variant="outline" className="mx-auto">
              <Shield className="w-3 h-3 mr-1" />
              Perfil: {ROLE_LABELS[invitation.intended_role] || invitation.intended_role}
            </Badge>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="O seu nome completo"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10"
                    disabled={isLoading || !!invitation.email}
                  />
                </div>
                {invitation.email && (
                  <p className="text-xs text-muted-foreground">Email pré-definido pelo convite</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mín. 10 caracteres"
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maiúsculas, minúsculas, números e caracteres especiais
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Palavra-passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a palavra-passe"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "A criar conta..." : "Criar Conta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Fazer login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
