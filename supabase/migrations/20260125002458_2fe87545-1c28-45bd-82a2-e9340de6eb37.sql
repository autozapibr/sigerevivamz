-- Criar tabela para assinaturas de contratos
CREATE TABLE public.contract_signatures (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  
  -- Referência ao colaborador (pode ser professor ou employee)
  staff_id bigint NOT NULL,
  staff_type text NOT NULL CHECK (staff_type IN ('teacher', 'employee')),
  staff_name text NOT NULL,
  
  -- Dados do contrato
  contract_type text NOT NULL,
  contract_number text,
  contract_html text NOT NULL,
  
  -- Assinatura
  signature_data text, -- Base64 da assinatura desenhada
  signature_ip text,
  signature_user_agent text,
  signed_at timestamp with time zone,
  
  -- Token para assinatura remota
  signature_token uuid DEFAULT gen_random_uuid(),
  token_expires_at timestamp with time zone,
  
  -- Estado
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'signed', 'expired', 'cancelled')),
  
  -- Metadados de envio
  sent_via text CHECK (sent_via IN ('email', 'whatsapp', 'direct')),
  sent_to text,
  sent_at timestamp with time zone,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Índices para busca eficiente
CREATE INDEX idx_contract_signatures_staff ON public.contract_signatures(staff_id, staff_type);
CREATE INDEX idx_contract_signatures_token ON public.contract_signatures(signature_token) WHERE status IN ('pending', 'sent');
CREATE INDEX idx_contract_signatures_status ON public.contract_signatures(status);

-- RLS
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;

-- Política para staff admin
CREATE POLICY "Admin can manage contract_signatures"
ON public.contract_signatures
FOR ALL
USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role, 'SECRETARIA'::app_role]));

-- Política pública para assinatura via token (sem autenticação)
CREATE POLICY "Public can sign with valid token"
ON public.contract_signatures
FOR UPDATE
USING (
  signature_token IS NOT NULL 
  AND status IN ('pending', 'sent')
  AND (token_expires_at IS NULL OR token_expires_at > now())
)
WITH CHECK (
  signature_token IS NOT NULL 
  AND status IN ('pending', 'sent')
  AND (token_expires_at IS NULL OR token_expires_at > now())
);

-- Trigger para updated_at
CREATE TRIGGER update_contract_signatures_updated_at
BEFORE UPDATE ON public.contract_signatures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();