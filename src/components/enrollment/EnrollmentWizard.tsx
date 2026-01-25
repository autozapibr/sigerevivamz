import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Users, GraduationCap, FileText, 
  ChevronLeft, ChevronRight, Check, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCreateEnrollment } from '@/hooks/useEnrollments';
import { useCurrentAcademicYear } from '@/hooks/useEnrollments';
import { StudentDataStep } from './steps/StudentDataStep';
import { GuardianDataStep } from './steps/GuardianDataStep';
import { ClassFeeStep } from './steps/ClassFeeStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { ReviewStep } from './steps/ReviewStep';
import type { EnrollmentFormData } from '@/types/enrollment';

const STEPS = [
  { id: 1, title: 'Dados do Educando', icon: User },
  { id: 2, title: 'Encarregado de Educação', icon: Users },
  { id: 3, title: 'Turma e Propinas', icon: GraduationCap },
  { id: 4, title: 'Documentos', icon: FileText },
  { id: 5, title: 'Revisão', icon: Check },
];

// Validation schema
const enrollmentSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  gender: z.enum(['MASCULINO', 'FEMININO'], { required_error: 'Seleccione o género' }),
  bi_number: z.string().optional(),
  nuit: z.string().optional(),
  nationality: z.string().default('Moçambicana'),
  province: z.string().min(1, 'Seleccione a província'),
  district: z.string().min(1, 'Seleccione o distrito'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  health_notes: z.string().optional(),
  previous_school: z.string().optional(),
  guardian: z.object({
    full_name: z.string().min(3, 'Nome do encarregado é obrigatório'),
    relationship: z.string().min(1, 'Seleccione o parentesco'),
    bi_number: z.string().optional(),
    nuit: z.string().optional(),
    phone: z.string().min(9, 'Telefone é obrigatório'),
    phone_alt: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    occupation: z.string().optional(),
    workplace: z.string().optional(),
    address: z.string().optional(),
    province: z.string().optional(),
    district: z.string().optional(),
  }),
  class_id: z.number().optional(),
  monthly_fee: z.number().min(0, 'Valor inválido').default(0),
  enrollment_fee: z.number().min(0, 'Valor inválido').default(0),
  discount_percent: z.number().min(0).max(100, 'Desconto máximo é 100%').default(0),
});

interface EnrollmentWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function EnrollmentWizard({ onComplete, onCancel }: EnrollmentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [createdStudentId, setCreatedStudentId] = useState<number | null>(null);
  
  const { data: currentYear } = useCurrentAcademicYear();
  const createEnrollment = useCreateEnrollment();
  
  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      nationality: 'Moçambicana',
      monthly_fee: 0,
      enrollment_fee: 0,
      discount_percent: 0,
      guardian: {
        relationship: '',
        phone: '',
      },
    },
  });
  
  const progress = (currentStep / STEPS.length) * 100;
  
  const goNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = async () => {
    const values = form.getValues();
    
    if (!currentYear) {
      return;
    }
    
    try {
      const result = await createEnrollment.mutateAsync({
        ...values,
        academic_year_id: currentYear.id,
      });
      
      setCreatedStudentId(result.student.id);
      goNext(); // Go to documents step or complete
      onComplete?.();
    } catch (error) {
      // Error handled by mutation
    }
  };
  
  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof EnrollmentFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['full_name', 'birth_date', 'gender', 'province', 'district', 'address'];
        break;
      case 2:
        // Guardian fields need special handling
        const guardianResult = await form.trigger([
          'guardian.full_name',
          'guardian.relationship', 
          'guardian.phone'
        ] as any);
        return guardianResult;
      case 3:
        fieldsToValidate = ['monthly_fee', 'enrollment_fee'];
        break;
      default:
        return true;
    }
    
    return form.trigger(fieldsToValidate);
  };
  
  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      if (currentStep === 4) {
        // Submit on step 4 (before review)
        await handleSubmit();
      } else {
        goNext();
      }
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto border-border/50 bg-card/95 backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl">Nova Matrícula</CardTitle>
          {currentYear && (
            <span className="text-sm text-muted-foreground">
              Ano Lectivo: {currentYear.name}
            </span>
          )}
        </div>
        
        {/* Progress bar */}
        <Progress value={progress} className="h-2" />
        
        {/* Step indicators */}
        <div className="flex justify-between mt-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isComplete = currentStep > step.id;
            
            return (
              <div 
                key={step.id}
                className={`flex flex-col items-center gap-1 ${
                  isActive ? 'text-primary' : isComplete ? 'text-green-500' : 'text-muted-foreground'
                }`}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isActive ? 'bg-primary text-primary-foreground' : 
                    isComplete ? 'bg-green-500/20 text-green-500' : 'bg-muted'}
                `}>
                  {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className="text-xs text-center hidden md:block">{step.title}</span>
              </div>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 1 && <StudentDataStep form={form} />}
            {currentStep === 2 && <GuardianDataStep form={form} />}
            {currentStep === 3 && <ClassFeeStep form={form} />}
            {currentStep === 4 && (
              <DocumentsStep 
                studentId={createdStudentId} 
                onComplete={goNext}
              />
            )}
            {currentStep === 5 && (
              <ReviewStep 
                formData={form.getValues()} 
                studentId={createdStudentId}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? onCancel : goPrev}
            disabled={createEnrollment.isPending}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentStep === 1 ? 'Cancelar' : 'Anterior'}
          </Button>
          
          {currentStep < STEPS.length && (
            <Button
              type="button"
              onClick={handleNext}
              disabled={createEnrollment.isPending}
            >
              {createEnrollment.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A processar...
                </>
              ) : (
                <>
                  {currentStep === 4 ? 'Finalizar' : 'Seguinte'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
          
          {currentStep === STEPS.length && (
            <Button onClick={onComplete}>
              <Check className="w-4 h-4 mr-2" />
              Concluir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
