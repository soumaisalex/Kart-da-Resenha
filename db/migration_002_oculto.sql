-- Kart da Resenha — Migração 002
-- Rodar no console SQL do Neon (projeto já em produção, isso é incremental sobre o schema.sql original)

ALTER TABLE pilotos ADD COLUMN IF NOT EXISTS oculto BOOLEAN NOT NULL DEFAULT false;

DROP VIEW IF EXISTS vw_ranking_geral;

CREATE VIEW vw_ranking_geral AS
SELECT
  p.id AS piloto_id,
  p.nome,
  p.foto_url,
  COUNT(DISTINCT r.bateria_id) AS total_corridas,
  COALESCE(SUM(r.pontos_posicao + r.pontos_volta_rapida), 0) AS pontos_totais,
  MIN(r.melhor_volta_ms) AS melhor_volta_ms_historico
FROM pilotos p
LEFT JOIN resultados r ON r.piloto_id = p.id
WHERE p.status = 'aprovado' AND p.oculto = false
GROUP BY p.id, p.nome, p.foto_url
ORDER BY pontos_totais DESC;
