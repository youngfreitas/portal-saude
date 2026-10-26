import type { Metadata } from 'next';
import { Card, PageHead, Table } from '@/components/ds';

export const metadata: Metadata = { title: 'Acessibilidade', description: 'Recursos de acessibilidade do portal da Secretaria Municipal de Saúde de Ubatuba.' };

export default function Page() {
  return (
    <>
      <PageHead title="Acessibilidade" trail={[{ label: 'Início', href: '/' }, { label: 'Acessibilidade' }]} lead="O portal segue as diretrizes WCAG 2.1 nível AA e o Modelo de Acessibilidade em Governo Eletrônico (eMAG)." />
      <div className="su-container su-layout-aside" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="su-prose">
          <h2>Recursos disponíveis</h2>
          <ul>
            <li><strong>Tamanho do texto:</strong> botões A− e A+ na barra superior.</li>
            <li><strong>Alto contraste:</strong> botão na barra superior.</li>
            <li><strong>Navegação por teclado:</strong> use Tab e Shift+Tab; o foco aparece como um contorno azul. O link “Ir para o conteúdo” é o primeiro item da página.</li>
            <li><strong>Leitores de tela:</strong> estrutura de títulos, regiões e textos alternativos em todas as imagens de conteúdo.</li>
            <li><strong>Movimento reduzido:</strong> animações são desligadas se o seu sistema pedir.</li>
          </ul>
          <h2>Atalhos do navegador</h2>
          <p>Para ampliar a página, use <kbd>Ctrl</kbd> + <kbd>+</kbd> (ou <kbd>⌘</kbd> + <kbd>+</kbd>). Para reduzir, <kbd>Ctrl</kbd> + <kbd>−</kbd>.</p>
          <h2>Encontrou uma barreira?</h2>
          <p>Conte para nós pela página de <a href="/contatos">Contatos</a>, descrevendo a página e o problema. Vamos corrigir.</p>
        </div>
        <Card accent="accent"><h2 style={{ font: 'var(--text-h4)', marginBottom: 'var(--space-2)' }}>Em emergências</h2><p style={{ margin: 0 }}>Ligue para o SAMU <strong>192</strong>.</p></Card>
      </div>
    </>
  );
}
