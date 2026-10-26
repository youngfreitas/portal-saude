# Uso do Design System Saúde Ubatuba

- `src/styles/tokens.css`: cópia literal dos tokens do DS. `foundation.css`: equivalente ao `bundle.css` do DS (escala tipográfica, movimento, base) + breakpoints (≤1024 e ≤640). `components.css`: componentes do DS como classes `su-*` com os mesmos valores, mais componentes compostos pelos mesmos tokens (Table, Pagination, Steps, Accordion, Avatar, DescriptionList, Menu, Drawer, Media, SectionHeader, PageHead, Stat, Textarea, FileInput, Skeleton, RichTextEditor, PendingInfo, ShareButtons). `site.css`/`admin.css`: estrutura de páginas.
- `src/components/ds/`: um arquivo por componente; as páginas só importam de `@/components/ds`.
- Ícones: Lucide 0.462.0 (versão do DS), servidos de `public/icons` (copiados de `lucide-static` por `scripts/copy-icons.mjs`).
- Fontes: Raleway / Open Sans / Roboto Mono via `@fontsource` (mesmas famílias e pesos). **Diferença de entrega, não de identidade:** evita requisição ao Google antes do consentimento (LGPD).

## Desvios deliberados (acessibilidade AA)
| Item | DS | Portal | Motivo |
|---|---|---|---|
| Botão `accent` | fundo `#1D8DBF` + texto branco (≈3,6:1) | fundo `--blue-pmu-800` | contraste ≥ 4,5:1 |
| Switch desligado | `--neutral-400` | `--neutral-600` | contraste do controle ≥ 3:1 |
| Rótulo `.su-overline` | `--blue-pmu-700` | `--blue-pmu-800` | contraste do texto pequeno |
| Botão desabilitado | texto `--neutral-500` | `--neutral-700` | legibilidade |
| Borda de campos | `--border-default` | `--border-strong` | contraste de controle |

Sem emoji, voz “você”, verbos de ação nos botões, imagem ausente = área azul chapada com brasão.
