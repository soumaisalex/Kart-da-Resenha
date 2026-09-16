-- Kart da Resenha — Migração 004: limite de vagas por evento
-- Rodar no console SQL do Neon. Aditiva — não quebra nada existente.

ALTER TABLE eventos ADD COLUMN limite_vagas INTEGER; -- NULL = sem limite
