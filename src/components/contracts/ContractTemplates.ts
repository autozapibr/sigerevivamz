// Contract templates for Escola Reviva - Mozambique
export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: 'trabalho' | 'voluntariado' | 'estagio' | 'prestacao_servicos';
  icon: string;
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'efectivo',
    name: 'Contrato Efectivo',
    description: 'Contrato de trabalho por tempo indeterminado',
    category: 'trabalho',
    icon: 'FileText',
  },
  {
    id: 'prazo_determinado',
    name: 'Contrato a Prazo',
    description: 'Contrato de trabalho por tempo determinado',
    category: 'trabalho',
    icon: 'Calendar',
  },
  {
    id: 'prestacao_servicos',
    name: 'Prestação de Serviços',
    description: 'Contrato para prestação de serviços específicos',
    category: 'prestacao_servicos',
    icon: 'Briefcase',
  },
  {
    id: 'estagio',
    name: 'Contrato de Estágio',
    description: 'Contrato para estagiários curriculares ou profissionais',
    category: 'estagio',
    icon: 'GraduationCap',
  },
  {
    id: 'voluntariado',
    name: 'Termo de Voluntariado',
    description: 'Termo de compromisso para trabalho voluntário',
    category: 'voluntariado',
    icon: 'Heart',
  },
];

export interface StaffContractData {
  id: number;
  staff_type: 'teacher' | 'employee';
  name: string;
  role: string;
  bi_number: string | null;
  nuit: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  gender: string | null;
  contract_number: string | null;
  contract_type: string | null;
  contract_start: string | null;
  contract_end: string | null;
  salary: number | null;
  hire_date: string | null;
  bank_name: string | null;
  bank_account: string | null;
  payment_method: string | null;
  mobile_money_provider: string | null;
  mobile_money_number: string | null;
}

export function formatDate(date: string | null): string {
  if (!date) return '____/____/________';
  return new Date(date).toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatCurrency(value: number | null): string {
  if (!value) return '________________ MT';
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2,
  }).format(value);
}

export function numberToWords(num: number): string {
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['', 'cem', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  if (num === 0) return 'zero';
  if (num < 10) return units[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return tens[ten] + (unit ? ' e ' + units[unit] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    if (num === 100) return 'cem';
    return hundreds[hundred] + (rest ? ' e ' + numberToWords(rest) : '');
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const rest = num % 1000;
    const thousandWord = thousand === 1 ? 'mil' : numberToWords(thousand) + ' mil';
    return thousandWord + (rest ? (rest < 100 ? ' e ' : ' ') + numberToWords(rest) : '');
  }
  return num.toLocaleString('pt-MZ');
}

export function generateContractNumber(staffType: 'teacher' | 'employee', staffId: number): string {
  const year = new Date().getFullYear();
  const prefix = staffType === 'teacher' ? 'PROF' : 'COLAB';
  return `CTR-${prefix}-${year}-${String(staffId).padStart(4, '0')}`;
}

export function generateContractHTML(template: string, data: StaffContractData): string {
  const today = formatDate(new Date().toISOString());
  const contractNumber = data.contract_number || generateContractNumber(data.staff_type, data.id);
  const salaryInWords = data.salary ? numberToWords(Math.floor(data.salary)) : '';
  
  const commonHeader = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">ESCOLA REVIVA</h1>
      <p style="font-size: 14px; color: #666; margin: 0;">Organização Sem Fins Lucrativos</p>
      <p style="font-size: 12px; color: #888; margin: 5px 0;">Moçambique</p>
    </div>
  `;

  const staffInfo = `
    <p><strong>Nome Completo:</strong> ${data.name || '________________________________'}</p>
    <p><strong>Número do BI:</strong> ${data.bi_number || '________________________________'}</p>
    <p><strong>NUIT:</strong> ${data.nuit || '________________________________'}</p>
    <p><strong>Endereço:</strong> ${data.address || '________________________________'}, ${data.district || '________'}, ${data.province || '________________'}</p>
    <p><strong>Telefone:</strong> ${data.phone || '________________________________'}</p>
    <p><strong>E-mail:</strong> ${data.email || '________________________________'}</p>
  `;

  const signatures = `
    <div style="margin-top: 60px;">
      <div style="display: flex; justify-content: space-between; margin-top: 80px;">
        <div style="text-align: center; width: 45%;">
          <div style="border-top: 1px solid #000; padding-top: 10px;">
            <p style="margin: 0;"><strong>Pela ESCOLA REVIVA</strong></p>
            <p style="margin: 5px 0; font-size: 12px;">(Representante Legal)</p>
          </div>
        </div>
        <div style="text-align: center; width: 45%;">
          <div style="border-top: 1px solid #000; padding-top: 10px;">
            <p style="margin: 0;"><strong>${data.name || 'O(A) Contratado(a)'}</strong></p>
            <p style="margin: 5px 0; font-size: 12px;">(${data.staff_type === 'teacher' ? 'Professor(a)' : 'Colaborador(a)'})</p>
          </div>
        </div>
      </div>
    </div>
  `;

  switch (template) {
    case 'efectivo':
      return `
        ${commonHeader}
        <h2 style="text-align: center; font-size: 18px; margin: 30px 0; text-decoration: underline;">
          CONTRATO DE TRABALHO POR TEMPO INDETERMINADO
        </h2>
        <p style="text-align: right; margin-bottom: 20px;"><strong>Nº do Contrato:</strong> ${contractNumber}</p>
        
        <p style="text-align: justify; line-height: 1.8;">
          Entre a <strong>ESCOLA REVIVA</strong>, organização sem fins lucrativos, doravante designada por <strong>PRIMEIRA OUTORGANTE</strong>, 
          e o(a) cidadão(ã) abaixo identificado(a), doravante designado(a) por <strong>SEGUNDO(A) OUTORGANTE</strong>, 
          é celebrado o presente contrato de trabalho por tempo indeterminado, nos termos da Lei do Trabalho de Moçambique:
        </p>

        <h3 style="margin-top: 30px;">IDENTIFICAÇÃO DO(A) TRABALHADOR(A)</h3>
        ${staffInfo}

        <h3 style="margin-top: 30px;">CLÁUSULAS</h3>
        
        <p style="text-align: justify; line-height: 1.8;">
          <strong>PRIMEIRA:</strong> O(A) SEGUNDO(A) OUTORGANTE é admitido(a) ao serviço da PRIMEIRA OUTORGANTE 
          para exercer as funções de <strong>${data.role || '________________'}</strong>.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>SEGUNDA:</strong> O presente contrato tem início em <strong>${formatDate(data.contract_start)}</strong>, 
          por tempo indeterminado, podendo ser denunciado por qualquer das partes nos termos da lei.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>TERCEIRA:</strong> O(A) SEGUNDO(A) OUTORGANTE perceberá uma remuneração mensal de 
          <strong>${formatCurrency(data.salary)}</strong> (${salaryInWords} meticais), 
          sujeita aos descontos legais.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>QUARTA:</strong> O horário de trabalho será de 40 horas semanais, distribuídas de segunda a sexta-feira, 
          das 07h30 às 15h30, com intervalo para almoço.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>QUINTA:</strong> O(A) SEGUNDO(A) OUTORGANTE terá direito a férias anuais remuneradas, 
          subsídios de férias e de Natal, nos termos da legislação em vigor.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>SEXTA:</strong> Ambas as partes comprometem-se a cumprir as disposições da Lei do Trabalho 
          e demais legislação aplicável.
        </p>

        <p style="margin-top: 30px;">Feito em duplicado, ficando cada parte com um exemplar.</p>
        <p>Nampula, ${today}</p>

        ${signatures}
      `;

    case 'prazo_determinado':
      return `
        ${commonHeader}
        <h2 style="text-align: center; font-size: 18px; margin: 30px 0; text-decoration: underline;">
          CONTRATO DE TRABALHO A PRAZO DETERMINADO
        </h2>
        <p style="text-align: right; margin-bottom: 20px;"><strong>Nº do Contrato:</strong> ${contractNumber}</p>
        
        <p style="text-align: justify; line-height: 1.8;">
          Entre a <strong>ESCOLA REVIVA</strong>, organização sem fins lucrativos, doravante designada por <strong>PRIMEIRA OUTORGANTE</strong>, 
          e o(a) cidadão(ã) abaixo identificado(a), doravante designado(a) por <strong>SEGUNDO(A) OUTORGANTE</strong>, 
          é celebrado o presente contrato de trabalho a prazo determinado:
        </p>

        <h3 style="margin-top: 30px;">IDENTIFICAÇÃO DO(A) TRABALHADOR(A)</h3>
        ${staffInfo}

        <h3 style="margin-top: 30px;">CLÁUSULAS</h3>
        
        <p style="text-align: justify; line-height: 1.8;">
          <strong>PRIMEIRA:</strong> O(A) SEGUNDO(A) OUTORGANTE é admitido(a) para exercer as funções de 
          <strong>${data.role || '________________'}</strong>.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>SEGUNDA:</strong> O presente contrato tem início em <strong>${formatDate(data.contract_start)}</strong> 
          e término em <strong>${formatDate(data.contract_end)}</strong>, podendo ser renovado por acordo das partes.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>TERCEIRA:</strong> A remuneração mensal será de <strong>${formatCurrency(data.salary)}</strong> 
          (${salaryInWords} meticais), sujeita aos descontos legais.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>QUARTA:</strong> O contrato pode ser rescindido antecipadamente por qualquer das partes, 
          mediante aviso prévio de 30 dias.
        </p>

        <p style="margin-top: 30px;">Feito em duplicado, ficando cada parte com um exemplar.</p>
        <p>Nampula, ${today}</p>

        ${signatures}
      `;

    case 'voluntariado':
      return `
        ${commonHeader}
        <h2 style="text-align: center; font-size: 18px; margin: 30px 0; text-decoration: underline;">
          TERMO DE ADESÃO AO VOLUNTARIADO
        </h2>
        <p style="text-align: right; margin-bottom: 20px;"><strong>Nº do Termo:</strong> ${contractNumber}</p>
        
        <p style="text-align: justify; line-height: 1.8;">
          A <strong>ESCOLA REVIVA</strong>, organização sem fins lucrativos dedicada à educação, 
          e o(a) voluntário(a) abaixo identificado(a), celebram o presente Termo de Adesão ao Voluntariado:
        </p>

        <h3 style="margin-top: 30px;">IDENTIFICAÇÃO DO(A) VOLUNTÁRIO(A)</h3>
        ${staffInfo}

        <h3 style="margin-top: 30px;">COMPROMISSOS</h3>
        
        <p style="text-align: justify; line-height: 1.8;">
          <strong>1.</strong> O(A) voluntário(a) compromete-se a prestar serviços de <strong>${data.role || '________________'}</strong> 
          de forma livre, voluntária e não remunerada, motivado(a) por razões de solidariedade e compromisso social.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>2.</strong> A actividade voluntária terá início em <strong>${formatDate(data.contract_start)}</strong>, 
          ${data.contract_end ? `com término previsto para <strong>${formatDate(data.contract_end)}</strong>` : 'por tempo indeterminado'}.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>3.</strong> O(A) voluntário(a) não terá vínculo empregatício com a ESCOLA REVIVA, 
          não fazendo jus a remuneração ou quaisquer benefícios trabalhistas.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>4.</strong> A ESCOLA REVIVA compromete-se a:
        </p>
        <ul style="line-height: 1.8;">
          <li>Fornecer informações sobre a missão e valores da organização;</li>
          <li>Oferecer formação adequada para o desempenho das actividades;</li>
          <li>Garantir condições de segurança e saúde no trabalho;</li>
          <li>Emitir declaração comprovativa da actividade voluntária quando solicitado.</li>
        </ul>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>5.</strong> O presente termo pode ser rescindido a qualquer momento por qualquer das partes, 
          mediante comunicação prévia.
        </p>

        <p style="margin-top: 30px;">Feito em duplicado, ficando cada parte com um exemplar.</p>
        <p>Nampula, ${today}</p>

        ${signatures}
      `;

    case 'estagio':
      return `
        ${commonHeader}
        <h2 style="text-align: center; font-size: 18px; margin: 30px 0; text-decoration: underline;">
          CONTRATO DE ESTÁGIO
        </h2>
        <p style="text-align: right; margin-bottom: 20px;"><strong>Nº do Contrato:</strong> ${contractNumber}</p>
        
        <p style="text-align: justify; line-height: 1.8;">
          Entre a <strong>ESCOLA REVIVA</strong>, organização sem fins lucrativos, e o(a) estagiário(a) 
          abaixo identificado(a), é celebrado o presente Contrato de Estágio:
        </p>

        <h3 style="margin-top: 30px;">IDENTIFICAÇÃO DO(A) ESTAGIÁRIO(A)</h3>
        ${staffInfo}

        <h3 style="margin-top: 30px;">CLÁUSULAS</h3>
        
        <p style="text-align: justify; line-height: 1.8;">
          <strong>PRIMEIRA:</strong> O(A) estagiário(a) realizará estágio na área de <strong>${data.role || '________________'}</strong>, 
          com o objectivo de complementar a formação académica através de experiência prática.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>SEGUNDA:</strong> O estágio terá início em <strong>${formatDate(data.contract_start)}</strong> 
          e término em <strong>${formatDate(data.contract_end)}</strong>.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>TERCEIRA:</strong> ${data.salary ? `O(A) estagiário(a) receberá uma bolsa-auxílio mensal de <strong>${formatCurrency(data.salary)}</strong>.` : 'O presente estágio é não remunerado.'}
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>QUARTA:</strong> A carga horária será de 20 a 30 horas semanais, compatível com as actividades académicas.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>QUINTA:</strong> A ESCOLA REVIVA designará um supervisor para acompanhar e orientar as actividades do(a) estagiário(a).
        </p>

        <p style="margin-top: 30px;">Feito em duplicado, ficando cada parte com um exemplar.</p>
        <p>Nampula, ${today}</p>

        ${signatures}
      `;

    case 'prestacao_servicos':
      return `
        ${commonHeader}
        <h2 style="text-align: center; font-size: 18px; margin: 30px 0; text-decoration: underline;">
          CONTRATO DE PRESTAÇÃO DE SERVIÇOS
        </h2>
        <p style="text-align: right; margin-bottom: 20px;"><strong>Nº do Contrato:</strong> ${contractNumber}</p>
        
        <p style="text-align: justify; line-height: 1.8;">
          Entre a <strong>ESCOLA REVIVA</strong>, organização sem fins lucrativos, doravante designada por <strong>CONTRATANTE</strong>, 
          e o(a) profissional abaixo identificado(a), doravante designado(a) por <strong>PRESTADOR(A) DE SERVIÇOS</strong>:
        </p>

        <h3 style="margin-top: 30px;">IDENTIFICAÇÃO DO(A) PRESTADOR(A)</h3>
        ${staffInfo}

        <h3 style="margin-top: 30px;">CLÁUSULAS</h3>
        
        <p style="text-align: justify; line-height: 1.8;">
          <strong>PRIMEIRA - DO OBJECTO:</strong> O(A) PRESTADOR(A) obriga-se a prestar serviços de 
          <strong>${data.role || '________________'}</strong> à CONTRATANTE.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>SEGUNDA - DO PRAZO:</strong> O presente contrato vigorará de <strong>${formatDate(data.contract_start)}</strong> 
          a <strong>${formatDate(data.contract_end)}</strong>, podendo ser renovado por acordo das partes.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>TERCEIRA - DA REMUNERAÇÃO:</strong> Pelos serviços prestados, o(a) PRESTADOR(A) receberá 
          o valor de <strong>${formatCurrency(data.salary)}</strong> ${data.salary ? `(${salaryInWords} meticais)` : ''}.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>QUARTA - DA AUTONOMIA:</strong> O(A) PRESTADOR(A) executará os serviços com autonomia técnica, 
          sem vínculo empregatício com a CONTRATANTE.
        </p>

        <p style="text-align: justify; line-height: 1.8;">
          <strong>QUINTA - DA RESCISÃO:</strong> O contrato poderá ser rescindido por qualquer das partes, 
          mediante aviso prévio de 15 dias.
        </p>

        <p style="margin-top: 30px;">Feito em duplicado, ficando cada parte com um exemplar.</p>
        <p>Nampula, ${today}</p>

        ${signatures}
      `;

    default:
      return '<p>Modelo de contrato não encontrado.</p>';
  }
}
