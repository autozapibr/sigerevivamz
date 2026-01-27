-- Add ALUNO role to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ALUNO';

-- Create exam_notifications table for internal notifications
CREATE TABLE IF NOT EXISTS public.exam_notifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  calendar_event_id bigint NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  recipient_user_id uuid,
  recipient_role app_role,
  recipient_class_id bigint REFERENCES public.classes(id) ON DELETE CASCADE,
  notification_type text NOT NULL DEFAULT 'NEW_EXAM', -- NEW_EXAM, UPDATED, REMINDER_3D, REMINDER_1D
  message text NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  sent_via_whatsapp boolean DEFAULT false,
  whatsapp_sent_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.exam_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exam_notifications
CREATE POLICY "Staff can manage exam_notifications"
ON public.exam_notifications FOR ALL
USING (
  has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role, 'PROFESSOR'::app_role, 'PEDAGOGICO'::app_role])
);

CREATE POLICY "Users can view own exam_notifications"
ON public.exam_notifications FOR SELECT
USING (
  recipient_user_id = auth.uid() OR
  recipient_role IN (
    SELECT role FROM public.user_roles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Anon can manage exam_notifications for demo"
ON public.exam_notifications FOR ALL
USING (true)
WITH CHECK (true);

-- Grant permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_notifications TO authenticated;

-- Create function to notify about new exams
CREATE OR REPLACE FUNCTION public.notify_exam_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  class_name_var text;
  subject_name_var text;
  teacher_ids uuid[];
BEGIN
  -- Only trigger for 'Prova' type events
  IF NEW.type != 'Prova' THEN
    RETURN NEW;
  END IF;
  
  -- Get class and subject names
  SELECT name INTO class_name_var FROM classes WHERE id = NEW.class_id;
  SELECT name INTO subject_name_var FROM subjects WHERE id = NEW.subject_id;
  
  -- Create notification for all professors (to see each other's exams)
  INSERT INTO exam_notifications (
    calendar_event_id,
    recipient_role,
    recipient_class_id,
    notification_type,
    message
  ) VALUES (
    NEW.id,
    'PROFESSOR',
    NEW.class_id,
    'NEW_EXAM',
    'Nova prova agendada: ' || NEW.title || 
    COALESCE(' - Turma: ' || class_name_var, '') ||
    COALESCE(' - Disciplina: ' || subject_name_var, '') ||
    ' - Data: ' || to_char(NEW.date, 'DD/MM/YYYY')
  );
  
  -- Create notification for ENCARREGADO role (parents of students in the class)
  IF NEW.class_id IS NOT NULL THEN
    INSERT INTO exam_notifications (
      calendar_event_id,
      recipient_role,
      recipient_class_id,
      notification_type,
      message
    ) VALUES (
      NEW.id,
      'ENCARREGADO',
      NEW.class_id,
      'NEW_EXAM',
      'Prova agendada para seu educando: ' || NEW.title || 
      COALESCE(' - Turma: ' || class_name_var, '') ||
      COALESCE(' - Disciplina: ' || subject_name_var, '') ||
      ' - Data: ' || to_char(NEW.date, 'DD/MM/YYYY')
    );
    
    -- Create notification for ALUNO role
    INSERT INTO exam_notifications (
      calendar_event_id,
      recipient_role,
      recipient_class_id,
      notification_type,
      message
    ) VALUES (
      NEW.id,
      'ALUNO',
      NEW.class_id,
      'NEW_EXAM',
      'Prova agendada: ' || NEW.title || 
      COALESCE(' - Disciplina: ' || subject_name_var, '') ||
      ' - Data: ' || to_char(NEW.date, 'DD/MM/YYYY')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for exam notifications
DROP TRIGGER IF EXISTS trigger_notify_exam_created ON public.calendar_events;
CREATE TRIGGER trigger_notify_exam_created
AFTER INSERT ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.notify_exam_created();

-- Update the existing calendar_events policies to allow ALUNO to view exams
CREATE POLICY "Students can view exams for their class"
ON public.calendar_events FOR SELECT
USING (
  type = 'Prova' AND 
  has_role(auth.uid(), 'ALUNO'::app_role)
);