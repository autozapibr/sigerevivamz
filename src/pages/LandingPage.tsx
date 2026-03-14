import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Users, BookOpen, CreditCard, BarChart3,
  Calendar, Shield, Bell, ArrowRight, CheckCircle2, Sun, Moon } from
'lucide-react';
import { Button } from '@/components/ui/button';
import logoReviva from '@/assets/escola-reviva-logo.webp';
import heroImage from '@/assets/hero-kids.jpg';
import classroomImage from '@/assets/kids-classroom.jpg';
import learningImage from '@/assets/kids-learning.jpg';
import aepLogo from '@/assets/aep-logo.png';

const features = [
{ icon: Users, title: 'Gestão de Educandos', desc: 'Cadastro completo, histórico académico, documentos e acompanhamento individualizado.' },
{ icon: BookOpen, title: 'Gestão Pedagógica', desc: 'Planos de aula com IA, lançamento de notas (0-20), currículo e calendário de provas.' },
{ icon: CreditCard, title: 'Gestão Financeira', desc: 'Propinas, cobranças, caixa, relatórios financeiros e recibos em MZN.' },
{ icon: BarChart3, title: 'Relatórios MEC', desc: 'Relatórios padronizados conforme directrizes do Ministério da Educação e Cultura de Moçambique.' },
{ icon: Calendar, title: 'Presenças e Calendário', desc: 'Controlo de frequência, eventos escolares e calendário académico integrado.' },
{ icon: Shield, title: 'Segurança e Controlo', desc: 'Perfis de acesso (Diretoria, Secretaria, Professor, Encarregado) com RLS.' },
{ icon: Bell, title: 'Comunicação', desc: 'Avisos, notificações e comunicação com encarregados de educação.' },
{ icon: GraduationCap, title: 'Matrículas Online', desc: 'Processo de matrícula digital com documentos, turmas e propinas integrados.' }];


const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } })
};

export default function LandingPage() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
  }, [isDark]);

  // Force dark on mount for landing
  useEffect(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between py-[16px]">
          <div className="flex items-center gap-3">
            <img alt="Escola Reviva" className="h-10 sm:h-12 w-auto object-fill" src={sigerLogo} />
            <div className="hidden sm:block">
              <span className="font-bold text-primary text-lg">SiGER</span>
              <p className="text-muted-foreground leading-tight text-sm">Sistema de Gestão Escolar</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              whileTap={{ scale: 0.9, rotate: 180 }}
              transition={{ duration: 0.3 }}
              aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}>
              {isDark ? <Sun className="h-5 w-5 text-foreground" /> : <Moon className="h-5 w-5 text-foreground" />}
            </motion.button>
            <Button asChild>
              <Link to="/login">
                Entrar <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Crianças da Escola Reviva" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32 lg:py-40">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}>
            
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <GraduationCap className="h-3.5 w-3.5" />
              Escola Reviva · Moçambique
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              <span className="text-primary">SiGER</span>
              <br />
              <span className="text-foreground/90">Gestão Escolar Inteligente</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mb-8 leading-relaxed">
              Plataforma completa para a gestão da <strong>Escola Reviva</strong>: educandos, professores, avaliações, propinas e relatórios — tudo conforme as directrizes do MEC.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="text-base">
                <Link to="/login">
                  Aceder ao Sistema <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Funcionalidades do Sistema</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Tudo o que a escola precisa, numa única plataforma moderna e segura.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) =>
            <motion.div
              key={f.title}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}>
              
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* AEP Section */}
      <section className="py-20 sm:py-28 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}>
              
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
                <BookOpen className="h-3.5 w-3.5" />
                Nosso Diferencial
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Abordagem Educacional por Princípios (AEP)
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                A Escola Reviva adopta a <strong>AEP</strong> — uma abordagem de ensino e aprendizagem que parte do raciocínio sobre verdades bíblicas, identifica os fundamentos do conhecimento e conduz à reflexão de causa-efeito, desenvolvendo <strong>entendimento realizador e caráter cristão</strong>.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Baseada na metodologia <strong>PRRR</strong> — Pesquisar, Raciocinar, Relacionar e Registar — a AEP integra filosofia, currículo e metodologia cristãs num processo educativo que envolve família, igreja e escola.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                { letter: 'P', word: 'Pesquisar', desc: 'Investigar as fontes e definir conceitos' },
                { letter: 'R', word: 'Raciocinar', desc: 'Analisar princípios e suas aplicações' },
                { letter: 'R', word: 'Relacionar', desc: 'Conectar o aprendizado com a vida' },
                { letter: 'R', word: 'Registar', desc: 'Documentar e aplicar o conhecimento' }].
                map((step, i) =>
                <motion.div
                  key={step.word}
                  className="bg-card rounded-lg border border-border p-4"
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}>
                  
                    <span className="text-2xl font-extrabold text-primary">{step.letter}</span>
                    <h4 className="font-semibold text-sm mt-1">{step.word}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
                  </motion.div>
                )}
              </div>

              <a
                href="https://aecep.org.br/aep"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                
                Saiba mais sobre a AEP na AECEP <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>

            <motion.div
              className="flex flex-col items-center gap-8"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}>
              
              <img
                src={aepLogo}
                alt="Escola Reviva - Abordagem Educacional por Princípios"
                className="w-full max-w-sm rounded-2xl shadow-xl" />
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <img
                  src={classroomImage}
                  alt="Educandos na sala de aula"
                  className="rounded-2xl shadow-lg w-full h-40 object-cover" />
                
                <img
                  src={learningImage}
                  alt="Crianças aprendendo"
                  className="rounded-2xl shadow-lg w-full h-40 object-cover" />
                
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About / Mission */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}>
              
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Restaurar Vidas e Valores
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                A Escola Reviva acredita na transformação pela educação. O SiGER foi desenhado para apoiar essa missão, simplificando a gestão escolar e permitindo que a equipa se concentre no que realmente importa: <strong>os educandos</strong>.
              </p>
              <ul className="space-y-4">
                {[
                'Localizado para Moçambique (MZN, BI, NUIT)',
                'Relatórios conforme o MEC',
                'Acessível em qualquer dispositivo',
                'Segurança com controlo de acesso por perfil'].
                map((item) =>
                <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground/80">{item}</span>
                  </li>
                )}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            
            <GraduationCap className="h-12 w-12 text-primary-foreground mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Pronto para aceder ao SiGER?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Entre no sistema para gerir educandos, avaliar desempenho, controlar finanças e muito mais.
            </p>
            <Button size="lg" variant="secondary" asChild className="text-base">
              <Link to="/login">
                Aceder ao Sistema <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoReviva} alt="Escola Reviva" className="h-8 w-auto" />
            <span className="text-sm text-muted-foreground">
              © 2026 SiGER - Sistema de Gestão Escolar Reviva
            </span>
          </div>
          <p className="text-xs text-muted-foreground/60">
            Feito com ❤️ por{' '}
            <a href="https://autozapi.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              AutoZapi
            </a>{' '}
            Soluções em TI, AI e Automações.
          </p>
        </div>
      </footer>
    </div>);

}