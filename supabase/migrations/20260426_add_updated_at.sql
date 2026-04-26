-- Adiciona coluna updated_at em blog_posts com trigger automático
-- Para usar como dateModified no schema.org Article (sinal de "freshness" para SEO/GEO)

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Backfill: posts existentes recebem updated_at = published_at
UPDATE blog_posts
  SET updated_at = COALESCE(published_at, created_at, now())
  WHERE updated_at IS NULL OR updated_at = created_at;

-- Trigger: atualiza updated_at automaticamente em qualquer UPDATE
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Índice opcional para queries por updated_at (útil em sitemap.xml e cache invalidation)
CREATE INDEX IF NOT EXISTS idx_blog_posts_updated_at ON blog_posts(updated_at DESC);
