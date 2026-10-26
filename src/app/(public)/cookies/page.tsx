import type { Metadata } from 'next';
import { LegalPage } from '@/components/site/LegalPage';
import { Table } from '@/components/ds';
import { CookiePrefsButton } from '@/components/consent/ConsentGate';

export const metadata: Metadata = { title: 'Política de Cookies' };

const rows = [
  { name: 'su_consent', type: 'Necessário', purpose: 'Guarda sua escolha de cookies e a versão do aviso.', time: '12 meses' },
  { name: 'su_admin_session', type: 'Necessário (painel)', purpose: 'Mantém a sessão de servidores autorizados no painel administrativo. Não é criado para visitantes.', time: '8 horas' },
  { name: 'su_a11y (armazenamento local)', type: 'Necessário', purpose: 'Lembra tamanho de texto e alto contraste.', time: 'Até você limpar' },
  { name: 'YouTube / OpenStreetMap', type: 'Terceiros', purpose: 'Somente carregados após o seu consentimento, para exibir vídeos e o mapa.', time: 'Definido pelo provedor' },
];

export default function Page() {
  return (
    <LegalPage title="Política de Cookies" lead="Cookies são pequenos arquivos guardados no seu navegador. Explicamos quais usamos e como você controla cada um.">
      <h2>Categorias</h2>
      <ul>
        <li><strong>Necessários:</strong> indispensáveis ao funcionamento; não podem ser desativados.</li>
        <li><strong>Desempenho:</strong> medem o uso do portal. Atualmente nenhuma ferramenta de estatística está ativa.</li>
        <li><strong>Terceiros:</strong> vídeos, mapa e publicações incorporadas. Só carregam se você permitir.</li>
      </ul>
      <h2>Cookies e armazenamentos em uso</h2>
      <Table rowKey={(r) => r.name} caption="Cookies em uso" columns={[
        { header: 'Nome', cell: (r) => <code>{r.name}</code> }, { header: 'Tipo', cell: (r) => r.type },
        { header: 'Finalidade', cell: (r) => r.purpose }, { header: 'Duração', cell: (r) => r.time },
      ]} rows={rows} />
      <h2>Como alterar sua escolha</h2>
      <p>Use o botão abaixo ou o link “Preferências de cookies” no rodapé de qualquer página. Você também pode apagar cookies nas configurações do navegador.</p>
      <p><CookiePrefsButton className="su-btn" /></p>
    </LegalPage>
  );
}
