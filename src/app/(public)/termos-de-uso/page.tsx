import type { Metadata } from 'next';
import { LegalPage } from '@/components/site/LegalPage';

export const metadata: Metadata = { title: 'Termos de Uso' };

export default function Page() {
  return (
    <LegalPage title="Termos de Uso" lead="Regras gerais de uso do portal da Secretaria Municipal de Saúde de Ubatuba.">
      <h2>1. Finalidade</h2>
      <p>O portal informa a população sobre unidades, serviços, campanhas e comunicados da Secretaria Municipal de Saúde. Ele não substitui o atendimento em unidade de saúde.</p>
      <h2>2. Em caso de emergência</h2>
      <p>Ligue para o SAMU <strong>192</strong>. Não use o formulário de contato para urgências.</p>
      <h2>3. Conteúdo</h2>
      <p>As informações são atualizadas pela equipe da Secretaria. Itens marcados como “Informação pendente de confirmação oficial” ainda não foram validados; confirme diretamente com a unidade antes de se deslocar.</p>
      <h2>4. Uso adequado</h2>
      <p>É proibido usar o portal para fins ilícitos, tentar acessar áreas restritas ou enviar mensagens ofensivas, falsas ou com dados de terceiros sem autorização.</p>
      <h2>5. Links externos</h2>
      <p>O portal pode apontar para sites de terceiros, cujo conteúdo não é de responsabilidade da Secretaria.</p>
      <h2>6. Propriedade intelectual</h2>
      <p>O brasão de Ubatuba e a identidade visual pertencem à Prefeitura Municipal de Ubatuba. Os textos oficiais podem ser reproduzidos citando a fonte.</p>
      <h2>7. Foro</h2>
      <p>Aplica-se a legislação brasileira. Dúvidas podem ser encaminhadas pela página de <a href="/contatos">Contatos</a>.</p>
    </LegalPage>
  );
}
