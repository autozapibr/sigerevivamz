import React from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { LLMConfigSection } from '@/components/settings/LLMConfigSection';

export default function IAConfigPage() {
  return (
    <MainLayout title="Inteligência Artificial" subtitle="Configure o provedor e modelo de IA do sistema">
      <motion.div
        className="space-y-6 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LLMConfigSection />
      </motion.div>
    </MainLayout>
  );
}
