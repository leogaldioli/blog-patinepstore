-- Blog Topics: fila de geração
CREATE TABLE blog_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  title_suggestion TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'guia-de-compra',
    'manutencao',
    'regulamentacao',
    'economia',
    'seguranca',
    'hiperlocal',
    'delivery',
    'faq',
    'tecnico',
    'lifestyle'
  )),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'done', 'error')),
  priority INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now(),
  generated_at TIMESTAMPTZ
);

-- Blog Posts: conteúdo publicado
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES blog_topics(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  content_html TEXT NOT NULL,
  category TEXT NOT NULL,
  reading_time_min INTEGER DEFAULT 5,
  faq_json JSONB,
  cta_html TEXT,
  lp_link TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'removed')),
  published_at TIMESTAMPTZ DEFAULT now(),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_topics_status ON blog_topics(status);
CREATE INDEX idx_blog_topics_category ON blog_topics(category);

-- RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts publicados são públicos" ON blog_posts
  FOR SELECT USING (status = 'published');

ALTER TABLE blog_topics ENABLE ROW LEVEL SECURITY;
-- topics só acessíveis via service role (sem policy pública)
