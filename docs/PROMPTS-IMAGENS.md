# Prompts de imagem para a demonstração

Gere cada imagem no ChatGPT, salve **com o nome exato** da coluna *Arquivo* dentro de `demo-images/` (`.jpg`, `.png` ou `.webp`) e rode:

```bash
npm run db:seed:demo
```

O script importa o que encontrar e pode ser executado quantas vezes quiser (faltou uma imagem? gere, salve e rode de novo). Sem a imagem, o site mostra o brasão como substituto, então nada quebra.

## Instruções gerais (cole no começo de cada conversa)

> Vou pedir várias imagens para o site da Secretaria Municipal de Saúde de uma cidade litorânea brasileira (Ubatuba, SP). Estilo: fotografia realista e luminosa, cores naturais, paleta com toques de azul-marinho, azul e verde-água, sensação acolhedora e institucional. **Sem texto, letras, logotipos, marcas, placas legíveis ou números na imagem.** Pessoas diversas (idades, tons de pele), expressões naturais, sem rostos deformados. Nada de sangue, agulhas expostas ou imagens que gerem desconforto. Gere uma imagem por vez no formato pedido.

## Imagem de destaque da página inicial

| Arquivo | Formato | Onde aparece |
|---|---|---|
| `hero.jpg` | Horizontal 16:9 (ex.: 1792×1024) | Fundo da faixa azul da home (recebe um degradê azul por cima, então prefira áreas calmas à esquerda) |

**Prompt:** Fotografia aérea ao entardecer da orla de uma cidade litorânea brasileira com montanhas cobertas de Mata Atlântica ao fundo e mar azul-esverdeado; em primeiro plano à direita, uma enfermeira sorridente de jaleco branco e um médico conversando com uma família numa calçada da orla. Composição ampla, céu limpo, luz dourada suave, grande área livre e mais calma no lado esquerdo da imagem, sem texto.

## Unidades de saúde (foto da unidade)

Formato **horizontal 4:3 ou 3:2**. Aparecem no cartão e no topo da página de cada unidade.

| Arquivo | Prompt |
|---|---|
| `unidade-ubs-centro.jpg` | Fachada de uma Unidade Básica de Saúde brasileira moderna e térrea, paredes brancas e detalhes azuis, rampa de acessibilidade, jardim bem cuidado e palmeiras, céu azul de manhã, algumas pessoas aguardando na entrada. Sem texto nem placas legíveis. |
| `unidade-esf-itagua.jpg` | Pequena unidade de Saúde da Família num bairro residencial litorâneo, casa térrea pintada de branco e verde-água, varanda coberta com bancos, árvores tropicais ao redor, uma agente comunitária de saúde de colete conversando com uma moradora idosa à porta. Luz natural, sem texto. |
| `unidade-upa.jpg` | Fachada de uma Unidade de Pronto Atendimento 24 horas, prédio moderno de dois andares com grandes vidros, cobertura de entrada para ambulância, uma ambulância branca estacionada (sem letras), fim de tarde com iluminação acesa, atmosfera profissional e tranquila. Sem texto. |
| `unidade-caps.jpg` | Casa ampla e acolhedora adaptada como centro de atenção psicossocial, jardim com plantas e bancos de madeira, pessoas conversando em roda na varanda, atmosfera de acolhimento, luz suave de fim de manhã, tons verdes e azuis. Sem texto. |
| `unidade-farmacia.jpg` | Interior de uma farmácia pública municipal limpa e organizada: balcão de atendimento com um farmacêutico de jaleco entregando medicamentos a um paciente, prateleiras com caixas de remédios genéricas sem rótulos legíveis, iluminação clara, tons de branco e azul. Sem texto. |

## Notícias (capa)

Formato **horizontal 16:9** (ex.: 1792×1024).

| Arquivo | Prompt |
|---|---|
| `noticia-vacinacao.jpg` | Uma enfermeira sorridente de uniforme e máscara aplicando vacina no braço de uma senhora idosa que sorri, sala de vacinação limpa e iluminada, caderneta de vacinação sobre a mesa, tons de azul e branco. Close médio, sem seringa em evidência, sem texto. |
| `noticia-dengue.jpg` | Dois agentes de combate a endemias de colete e boné visitando uma casa de bairro litorâneo, orientando um morador junto a vasos de plantas e baldes no quintal para evitar água parada, dia ensolarado, vegetação tropical. Sem texto nem logotipos. |
| `noticia-ubs.jpg` | Recepção de uma UBS moderna com recepcionista sorridente atendendo um paciente ao balcão, sala de espera ampla com cadeiras azuis e pessoas aguardando, grande janela com luz natural. Sem texto. |
| `noticia-novembro-azul.jpg` | Grupo de homens de meia-idade e idosos conversando animadamente com uma médica e um enfermeiro numa roda de orientação ao ar livre, detalhes decorativos em azul (balões e fitas azuis), parque da cidade litorânea ao fundo, clima positivo. Sem texto. |

## Campanhas (arte de capa)

Formato **horizontal 16:9**. Ilustração/arte gráfica moderna, **sem nenhum texto**; o título já aparece no site.

| Arquivo | Prompt |
|---|---|
| `campanha-outubro-rosa.jpg` | Ilustração gráfica moderna e delicada com tema de conscientização do câncer de mama: composição com laço rosa estilizado, flores e folhas tropicais em tons de rosa e magenta sobre fundo claro, formas suaves e espaço livre. Sem texto. |
| `campanha-novembro-azul.jpg` | Ilustração gráfica moderna com tema de saúde do homem: laço azul estilizado, bigode minimalista e folhas tropicais em tons de azul e azul-marinho sobre fundo claro, formas limpas e espaço livre. Sem texto. |
| `campanha-dezembro-vermelho.jpg` | Ilustração gráfica moderna com tema de prevenção do HIV/aids: laço vermelho estilizado entre mãos de diferentes tons de pele que se unem, fundo claro com formas geométricas suaves em vermelho e coral. Sem texto. |
| `campanha-gripe.jpg` | Ilustração gráfica moderna de vacinação contra a gripe: escudo estilizado com cruz, silhuetas de família (criança, adulto e idosa) abraçadas, folhas tropicais, paleta azul-marinho, azul e verde-água, fundo claro. Sem texto. |

## Redes sociais (publicações)

Formato **quadrado 1:1** (ex.: 1024×1024).

| Arquivo | Prompt |
|---|---|
| `social-1.jpg` | Ilustração quadrada vibrante de uma caderneta de vacinação aberta com selos coloridos, ao lado de um escudo azul com cruz e pequenas estrelas, fundo azul-claro, estilo flat moderno. Sem texto. |
| `social-2.jpg` | Fotografia quadrada de um homem sorridente de camiseta azul conversando com uma enfermeira numa unidade de saúde, balão azul ao fundo, luz natural, clima acolhedor. Sem texto. |
| `social-3.jpg` | Ilustração quadrada em estilo flat com um quintal de casa brasileira, vaso de planta com prato sendo esvaziado, balde virado e uma lupa sobre um mosquito estilizado, cores verde, azul e amarelo. Sem texto. |

## Dicas

- Se o ChatGPT inserir texto na imagem, peça: *“refaça sem nenhum texto ou letra”*.
- Prefira JPG até ~2 MB por imagem; o portal gera três tamanhos automaticamente (480, 960 e 1600 px de largura).
- Para trocar uma imagem depois, use o painel **/admin → Mídia** ou apague o arquivo importado e rode o script de novo.
