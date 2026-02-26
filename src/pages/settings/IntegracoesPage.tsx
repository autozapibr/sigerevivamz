import React from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { IntegrationsSection } from '@/components/settings/IntegrationsSection';

export default function IntegracoesPage() {
  return (
    <MainLayout title="Integrações" subtitle="Configure APIs externas para mensagens e serviços">
      <motion.div
        className="space-y-6 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <IntegrationsSection />
      </motion.div>
    </MainLayout>
  );
}
