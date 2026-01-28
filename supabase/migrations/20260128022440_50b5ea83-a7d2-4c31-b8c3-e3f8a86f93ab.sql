-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can view own notifications" ON ticket_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON ticket_notifications;
DROP POLICY IF EXISTS "System can create notifications" ON ticket_notifications;
DROP POLICY IF EXISTS "Anon can view ticket_notifications for demo" ON ticket_notifications;
DROP POLICY IF EXISTS "Anon can insert ticket_notifications for demo" ON ticket_notifications;
DROP POLICY IF EXISTS "Anon can update ticket_notifications for demo" ON ticket_notifications;
DROP POLICY IF EXISTS "Anon can delete ticket_notifications for demo" ON ticket_notifications;

-- Agora alterar user_id para text
ALTER TABLE public.ticket_notifications 
  ALTER COLUMN user_id TYPE text;

-- Adicionar colunas para melhor roteamento
ALTER TABLE public.ticket_notifications 
  ADD COLUMN IF NOT EXISTS recipient_role text,
  ADD COLUMN IF NOT EXISTS recipient_name text;

-- Criar função para gerar notificações quando uma mensagem é inserida
CREATE OR REPLACE FUNCTION public.notify_ticket_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ticket_record RECORD;
  notification_message text;
BEGIN
  -- Buscar informações do ticket
  SELECT * INTO ticket_record FROM tickets WHERE id = NEW.ticket_id;
  
  -- Não criar notificação se ticket estiver fechado
  IF ticket_record.status = 'FECHADO' THEN
    RETURN NEW;
  END IF;
  
  -- Construir mensagem da notificação
  notification_message := 'Nova resposta no ticket ' || ticket_record.ticket_number || ': ' || LEFT(NEW.message, 100);
  
  -- Se a mensagem é de staff, notificar o criador do ticket
  IF NEW.sender_role IN ('ADMIN', 'DIRETORIA', 'SECRETARIA', 'FINANCEIRO', 'PEDAGOGICO') THEN
    INSERT INTO ticket_notifications (ticket_id, user_id, recipient_name, recipient_role, message, is_read)
    VALUES (
      NEW.ticket_id,
      COALESCE(ticket_record.created_by::text, 'anonymous'),
      ticket_record.created_by_name,
      ticket_record.created_by_role,
      notification_message,
      false
    );
  ELSE
    -- A mensagem é do criador, notificar o departamento atribuído
    INSERT INTO ticket_notifications (ticket_id, user_id, recipient_name, recipient_role, message, is_read)
    VALUES (
      NEW.ticket_id,
      COALESCE(ticket_record.assigned_to::text, 'department'),
      ticket_record.assigned_to_name,
      ticket_record.assigned_department,
      notification_message,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_notify_ticket_message ON ticket_messages;
CREATE TRIGGER trigger_notify_ticket_message
  AFTER INSERT ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_message();

-- Recriar políticas RLS permissivas para demo
CREATE POLICY "Allow all select on ticket_notifications"
ON ticket_notifications FOR SELECT USING (true);

CREATE POLICY "Allow all insert on ticket_notifications"
ON ticket_notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on ticket_notifications"
ON ticket_notifications FOR UPDATE USING (true);

CREATE POLICY "Allow all delete on ticket_notifications"
ON ticket_notifications FOR DELETE USING (true);