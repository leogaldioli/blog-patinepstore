// Pós-migração (jul/2026): blog_posts/blog_topics vivem no Postgres da VPS
// (clube-patinep-db). O shim pg reproduz a API do supabase-js usada aqui
// (.from().select().eq()..., contrato {data, error}) sobre conexão direta.
import { Pool } from "pg";
import { createPgClient, type QueryFn } from "./pg-shim";

let pool: Pool | null = null;
const poolQuery: QueryFn = async (sql, params) => {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL não definida (Postgres do clube na VPS)");
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  }
  const res = await pool.query(sql, params);
  return { rows: res.rows, rowCount: res.rowCount };
};

// Leitura de posts publicados (mesmo client para leitura e escrita — a
// separação anon/service era do Supabase; aqui a fronteira é o server).
export const supabase = createPgClient(poolQuery);

// Client admin — escrita (usado no cron de geração)
export const supabaseAdmin = createPgClient(poolQuery);

export * from "./blog-shared";
