-- Retry de tópicos que falharam na geração: o cron de refill re-enfileira
-- status='error' com retry_count < 3; acima disso o tópico fica descartado.
ALTER TABLE blog_topics
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
