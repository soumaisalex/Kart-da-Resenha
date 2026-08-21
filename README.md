# Kart da Resenha

Site para gerenciar ranking de corridas de kart entre amigos, com importação de
resultados por OCR (imagem/PDF) e perfis de piloto reivindicáveis.

## Stack

- **Frontend:** React + Vite, Tailwind CSS
- **API:** Cloudflare Pages Functions
- **Banco:** Neon PostgreSQL (`db/schema.sql`)
- **Arquivos:** Cloudflare R2 (fotos de perfil + PDFs/imagens originais das corridas)
- **OCR:** Cloudflare Workers AI (modelo de visão)

## Estrutura

```
src/                  # React (páginas, componentes)
functions/api/        # Cloudflare Pages Functions
functions/_lib/        # helpers compartilhados (db, cálculo de pontos)
db/schema.sql          # schema completo do Neon
wrangler.toml           # bindings de R2 e Workers AI
```

## Regras de negócio já implementadas na base

- **Pontuação:** por posição (config editável em `config_pontuacao_posicao`) + bônus de
  volta mais rápida da bateria (config editável em `config_geral`, padrão 5 pontos).
- **Perfis:** reivindicação sempre entra como `pendente`; aprovação manual no admin;
  edição travada pelos 4 últimos dígitos do telefone (`PATCH /api/pilotos/:id`).
- **Idade mínima:** confirmação de presença em evento futuro exige data de nascimento
  (salva permanentemente no primeiro uso) e bloqueia menores de 18 (`config_geral.idade_minima`).
- **Eventos:** `tipo = 'futuro'` até receber resultado importado, aí vira `'passado'`
  automaticamente.

## Configuração local

1. `npm install`
2. Copiar `.env.example` para `.env` e preencher `DATABASE_URL`
3. Rodar `db/schema.sql` no Neon (via console do Neon ou `psql`)
4. `npm run dev` (frontend) — para testar as Functions localmente, usar `wrangler pages dev`

## Pendências conhecidas (marcadas com TODO no código)

- Matching fuzzy nome OCR → perfil existente é client-side, por similaridade simples
- OCR só processa imagens (JPG/PNG) — PDF não é suportado pelo modelo de visão do Workers AI

## Próximas etapas sugeridas

1. Layout completo da Home (pódio, destaque de volta rápida, agenda de eventos)
2. Fluxo de OCR + tela de revisão no admin
3. Perfil do piloto + card de compartilhamento estilo Stories
