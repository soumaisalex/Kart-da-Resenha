-- Kart da Resenha — Schema Neon PostgreSQL
-- Convenção: timestamps em UTC, ids como identity/serial
-- Modelo multi-conta: cada campeonato pertence a uma conta (login via Google);
-- pilotos, eventos e configuração de pontuação são isolados por campeonato_id.

-- ==========================================
-- CONTAS (quem loga na plataforma, via Google)
-- ==========================================
CREATE TABLE contas (
  id         SERIAL PRIMARY KEY,
  google_id  VARCHAR(64) UNIQUE,
  email      VARCHAR(160) NOT NULL,
  nome       VARCHAR(120),
  foto_url   TEXT,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- CAMPEONATOS (cada conta pode ter um ou mais)
-- ==========================================
CREATE TABLE campeonatos (
  id         SERIAL PRIMARY KEY,
  conta_id   INTEGER REFERENCES contas(id) ON DELETE CASCADE,
  slug       VARCHAR(60) UNIQUE NOT NULL,   -- vira a URL pública: /c/:slug
  nome       VARCHAR(120) NOT NULL,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- PILOTOS
-- ==========================================
CREATE TABLE pilotos (
  id              SERIAL PRIMARY KEY,
  campeonato_id   INTEGER NOT NULL REFERENCES campeonatos(id) ON DELETE CASCADE,
  nome            VARCHAR(120) NOT NULL,
  telefone        VARCHAR(20),
  email           VARCHAR(160),
  instagram       VARCHAR(60),
  foto_url        TEXT,
  data_nascimento DATE,                     -- preenchida na 1ª confirmação de presença
  status          VARCHAR(20) NOT NULL DEFAULT 'pendente', -- pendente | aprovado
  oculto          BOOLEAN NOT NULL DEFAULT false,          -- true = removido do ranking/pontuação sem apagar histórico
  reivindicado_em TIMESTAMPTZ,
  aprovado_em     TIMESTAMPTZ,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pilotos_campeonato ON pilotos(campeonato_id);
CREATE INDEX idx_pilotos_status ON pilotos(status);
CREATE INDEX idx_pilotos_nome ON pilotos(nome);

-- ==========================================
-- EVENTOS
-- ==========================================
CREATE TABLE eventos (
  id                  SERIAL PRIMARY KEY,
  campeonato_id       INTEGER NOT NULL REFERENCES campeonatos(id) ON DELETE CASCADE,
  nome                VARCHAR(160),
  data_evento         DATE NOT NULL,
  local               VARCHAR(160),          -- ex: Kartódromo Emerson Fittipaldi
  tipo                VARCHAR(10) NOT NULL DEFAULT 'futuro', -- futuro | passado
  limite_vagas        INTEGER,               -- NULL = sem limite de confirmações
  arquivo_original_url TEXT,                 -- imagem/PDF enviado (fica salvo p/ auditoria + download)
  criado_em           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_eventos_campeonato ON eventos(campeonato_id);
CREATE INDEX idx_eventos_tipo ON eventos(tipo);
CREATE INDEX idx_eventos_data ON eventos(data_evento);

-- ==========================================
-- CONFIRMAÇÕES DE PRESENÇA (eventos futuros)
-- Não precisa de campeonato_id própria — já isolada via evento_id.
-- ==========================================
CREATE TABLE confirmacoes (
  id           SERIAL PRIMARY KEY,
  evento_id    INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  piloto_id    INTEGER NOT NULL REFERENCES pilotos(id) ON DELETE CASCADE,
  confirmado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (evento_id, piloto_id)
);

-- ==========================================
-- BATERIAS (cada evento pode ter mais de uma bateria/corrida)
-- Não precisa de campeonato_id própria — já isolada via evento_id.
-- ==========================================
CREATE TABLE baterias (
  id          SERIAL PRIMARY KEY,
  evento_id   INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  horario     TIME,
  descricao   VARCHAR(120),                  -- ex: "Bateria 19:00"
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_baterias_evento ON baterias(evento_id);

-- ==========================================
-- RESULTADOS (linha por piloto por bateria — vem do OCR)
-- Não precisa de campeonato_id própria — já isolada via bateria_id.
-- ==========================================
CREATE TABLE resultados (
  id            SERIAL PRIMARY KEY,
  bateria_id    INTEGER NOT NULL REFERENCES baterias(id) ON DELETE CASCADE,
  piloto_id     INTEGER REFERENCES pilotos(id) ON DELETE SET NULL,
  nome_bruto    VARCHAR(120) NOT NULL,        -- nome exatamente como leu no OCR (auditoria/matching)
  posicao       INTEGER NOT NULL,
  numero_kart   INTEGER,
  melhor_volta_ms   INTEGER,                  -- tempo em milissegundos p/ facilitar ordenação
  tempo_total_ms    BIGINT,
  gap_texto     VARCHAR(40),
  total_voltas  INTEGER,
  vel_media     NUMERIC(5,2),
  pontos_posicao    NUMERIC(6,2) DEFAULT 0,   -- calculado no import, conforme config_pontuacao vigente
  pontos_volta_rapida NUMERIC(6,2) DEFAULT 0,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_resultados_bateria ON resultados(bateria_id);
CREATE INDEX idx_resultados_piloto ON resultados(piloto_id);

-- ==========================================
-- CONFIGURAÇÃO DE PONTUAÇÃO (editável na área admin, por campeonato)
-- ==========================================
CREATE TABLE config_pontuacao_posicao (
  campeonato_id INTEGER NOT NULL REFERENCES campeonatos(id) ON DELETE CASCADE,
  posicao       INTEGER NOT NULL,
  pontos        NUMERIC(6,2) NOT NULL,
  PRIMARY KEY (campeonato_id, posicao)
);

CREATE TABLE config_geral (
  campeonato_id INTEGER NOT NULL REFERENCES campeonatos(id) ON DELETE CASCADE,
  chave         VARCHAR(60) NOT NULL,
  valor         VARCHAR(120) NOT NULL,
  PRIMARY KEY (campeonato_id, chave)
);

-- ==========================================
-- VIEW auxiliar: ranking geral (soma de pontos por piloto), por campeonato
-- ==========================================
CREATE VIEW vw_ranking_geral AS
SELECT
  p.id AS piloto_id,
  p.campeonato_id,
  p.nome,
  p.foto_url,
  COUNT(DISTINCT r.bateria_id) AS total_corridas,
  COALESCE(SUM(r.pontos_posicao + r.pontos_volta_rapida), 0) AS pontos_totais,
  MIN(r.melhor_volta_ms) AS melhor_volta_ms_historico
FROM pilotos p
LEFT JOIN resultados r ON r.piloto_id = p.id
WHERE p.status = 'aprovado' AND p.oculto = false
GROUP BY p.id, p.campeonato_id, p.nome, p.foto_url
ORDER BY pontos_totais DESC;

-- ==========================================
-- Exemplo: criar um campeonato novo e sua pontuação padrão
-- (o painel de contas já faz isso automaticamente ao criar um campeonato)
-- ==========================================
-- INSERT INTO campeonatos (conta_id, slug, nome) VALUES (1, 'meu-campeonato', 'Meu Campeonato');
-- INSERT INTO config_pontuacao_posicao (campeonato_id, posicao, pontos) VALUES
--   (1,1,25),(1,2,18),(1,3,15),(1,4,12),(1,5,10),(1,6,8),(1,7,6),(1,8,4),(1,9,2),(1,10,1);
-- INSERT INTO config_geral (campeonato_id, chave, valor) VALUES
--   (1,'pontos_melhor_volta','5'), (1,'idade_minima','18');
