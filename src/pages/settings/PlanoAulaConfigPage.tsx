import React from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { LessonPlanConfigSection } from '@/components/settings/LessonPlanConfigSection';

export default function PlanoAulaConfigPage() {
  return (
    <MainLayout title="Plano de Aulas AEP" subtitle="Configure campos e prompt para geração de planos de aula">
      <motion.div
        className="space-y-6 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LessonPlanConfigSection />
      </motion.div>
    </MainLayout>
  );
}
