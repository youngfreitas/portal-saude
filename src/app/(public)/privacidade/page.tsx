import type { Metadata } from 'next';
import { LegalPage } from '@/components/site/LegalPage';
import { PendingInfo } from '@/components/ds';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = { title: 'Política de Privacidade' };

export default async function Page() {
  const s = await getSettings();
  return (
    <LegalPage title="Política de Privacidade" lead="Como o portal trata os dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).">
      <h2>1. Quem somos</h2>
      <p>Este portal é mantido pela Secretaria Municipal de Saúde de Ubatuba, vinculada à Prefeitura Municipal de Ubatuba.</p>
      <p><strong>Controlador:</strong> {s.lgpd_controller || <PendingInfo />}<br /><strong>Encarregado (DPO):</strong> {s.lgpd_dpo_name ? `${s.lgpd_dpo_name}${s.lgpd_dpo_email ? ' — ' + s.lgpd_dpo_email : ''}` : <PendingInfo />}</p>
      <h2>2. Quais dados coletamos</h2>
      <ul>
        <li><strong>Formulário de contato:</strong> nome, e-mail, telefone (opcional), assunto e mensagem que você escreve. Base legal: consentimento e execução de políticas públicas.</li>
        <li><strong>Escolha de cookies:</strong> registramos sua preferência e a versão do aviso, sem endereço IP nem identificador pessoal.</li>
        <li><strong>Preferências de acessibilidade:</strong> tamanho do texto e contraste ficam apenas no seu navegador.</li>
      </ul>
      <p>O portal não coleta nem armazena dados clínicos. Por favor, não informe dados de saúde no formulário de contato.</p>
      <h2>3. Para que usamos</h2>
      <p>Responder às suas mensagens, melhorar o conteúdo do portal e cumprir obrigações legais. Não vendemos nem compartilhamos seus dados para publicidade.</p>
      <h2>4. Por quanto tempo guardamos</h2>
      <p>As mensagens são mantidas pelo tempo necessário ao atendimento e às obrigações legais de guarda de documentos públicos. <PendingInfo label="Prazo exato pendente de confirmação oficial" /></p>
      <h2>5. Compartilhamento</h2>
      <p>Conteúdos de terceiros (vídeos do YouTube, publicações de redes sociais e mapa do OpenStreetMap) só são carregados se você permitir cookies de terceiros. Nesse caso, o provedor pode coletar dados conforme sua própria política.</p>
      <h2>6. Seus direitos</h2>
      <p>Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação e informações sobre compartilhamento (art. 18 da LGPD) pelos canais da página de <a href="/contatos">Contatos</a>{s.lgpd_dpo_email && <> ou em {s.lgpd_dpo_email}</>}.</p>
      <h2>7. Segurança</h2>
      <p>Adotamos medidas técnicas como conexão segura, controle de acesso por perfil, registro de atividades do painel e senhas armazenadas com criptografia irreversível.</p>
      <h2>8. Atualizações</h2>
      <p>Esta política pode ser atualizada. A data da versão vigente consta nas informações do rodapé do painel administrativo.</p>
    </LegalPage>
  );
}
