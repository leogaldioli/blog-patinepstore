/**
 * One-time migration: add lang and original_slug columns to blog_posts.
 * Run on VPS after deploy: npx tsx scripts/migrate-lang.ts
 */
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Check if lang column exists
  const { error: checkErr } = await sb.from("blog_posts").select("lang").limit(1);

  if (!checkErr) {
    console.log("✓ lang column already exists — migration skipped");
    return;
  }

  if (!checkErr.message.includes("lang")) {
    console.error("Unexpected error:", checkErr.message);
    process.exit(1);
  }

  // Apply migration via rpc (requires exec_sql function in Supabase)
  // If exec_sql doesn't exist, apply via Supabase dashboard SQL Editor:
  console.log("Applying migration via SQL...");
  console.log("If this fails, run in Supabase SQL Editor:");
  console.log(`
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'pt';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS original_slug TEXT;
CREATE INDEX IF NOT EXISTS idx_blog_posts_lang ON blog_posts(lang);
  `);

  const { error } = await sb.rpc("exec_sql", {
    query: `
      ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'pt';
      ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS original_slug TEXT;
      CREATE INDEX IF NOT EXISTS idx_blog_posts_lang ON blog_posts(lang);
    `,
  });

  if (error) {
    console.error("Migration via rpc failed:", error.message);
    console.log("→ Apply migration manually in Supabase SQL Editor (SQL above)");
    process.exit(1);
  }

  console.log("✓ Migration applied successfully");
}

main();
