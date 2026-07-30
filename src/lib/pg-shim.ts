/**
 * Shim compatível com a API do supabase-js (PostgREST) sobre o driver pg.
 * Cobre APENAS a superfície usada neste codebase (auditada em jul/2026):
 * select/insert/update/upsert/delete, filtros (eq, neq, gt, gte, lt, lte,
 * like, ilike, is, in, not, or, match, filter, contains), order/limit/range,
 * single/maybeSingle, count exact (com e sem head), embeds many-to-one de
 * um nível e RETURNING via .select() após mutações.
 *
 * Contrato de retorno: { data, error, count } — NUNCA lança; erros SQL viram
 * { data: null, error: { message, code, details } } como no supabase-js.
 */

export type QueryFn = (
  sql: string,
  params: unknown[]
) => Promise<{ rows: Record<string, unknown>[]; rowCount: number | null }>;

export interface ShimError {
  message: string;
  code: string;
  details: string | null;
}

export interface ShimResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  error: ShimError | null;
  count: number | null;
}

// FK column → tabela alvo, para embeds `alias:fk_col(cols)`.
const FK_TARGETS: Record<string, string> = {
  referrer_id: "members",
  member_id: "members",
  team_member_id: "team_members",
  auth_user_id: "team_members",
  created_by: "team_members",
};

// Convenção para embed sem fk explícita: `members(...)` → fk `member_id`.
function conventionFk(table: string): string {
  return `${table.replace(/s$/, "")}_id`;
}

const OPS: Record<string, string> = {
  eq: "=",
  neq: "<>",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  like: "LIKE",
  ilike: "ILIKE",
};

function qi(name: string): string {
  return `"${name.replace(/"/g, "")}"`;
}

interface Embed {
  alias: string;
  table: string;
  fk: string;
  cols: string[];
}

type Mode = "select" | "insert" | "update" | "upsert" | "delete";

class PgQueryBuilder implements PromiseLike<ShimResponse> {
  private mode: Mode = "select";
  private table: string;
  private query: QueryFn;
  private cols = "*";
  private wantRows = false; // .select() após mutação → RETURNING
  private countMode: "exact" | null = null;
  private head = false;
  private wheres: string[] = [];
  private params: unknown[] = [];
  private orders: string[] = [];
  private limitN: number | null = null;
  private offsetN: number | null = null;
  private singleMode: "single" | "maybeSingle" | null = null;
  private values: Record<string, unknown>[] = [];
  private conflict: string[] = [];

  constructor(table: string, query: QueryFn) {
    this.table = table;
    this.query = query;
  }

  select(cols = "*", opts?: { count?: "exact"; head?: boolean }) {
    if (this.mode !== "select") {
      this.wantRows = true;
      return this;
    }
    this.cols = cols;
    if (opts?.count) this.countMode = opts.count;
    if (opts?.head) this.head = true;
    return this;
  }

  insert(values: Record<string, unknown> | Record<string, unknown>[]) {
    this.mode = "insert";
    this.values = Array.isArray(values) ? values : [values];
    return this;
  }

  upsert(
    values: Record<string, unknown> | Record<string, unknown>[],
    opts?: { onConflict?: string }
  ) {
    this.mode = "upsert";
    this.values = Array.isArray(values) ? values : [values];
    this.conflict = (opts?.onConflict ?? "").split(",").map((c) => c.trim()).filter(Boolean);
    return this;
  }

  update(values: Record<string, unknown>) {
    this.mode = "update";
    this.values = [values];
    return this;
  }

  delete() {
    this.mode = "delete";
    return this;
  }

  private p(value: unknown): string {
    this.params.push(value);
    return `$${this.params.length}`;
  }

  private cond(col: string, op: string, value: unknown): string {
    if (op === "is") {
      if (value === null) return `base.${qi(col)} IS NULL`;
      return `base.${qi(col)} IS ${value === true ? "TRUE" : "FALSE"}`;
    }
    if (op === "in") return `base.${qi(col)} = ANY(${this.p(value)})`;
    if (op === "cs" || op === "contains") return `base.${qi(col)} @> ${this.p(value)}`;
    const sqlOp = OPS[op];
    if (!sqlOp) throw new Error(`Operador não suportado pelo shim: ${op}`);
    return `base.${qi(col)} ${sqlOp} ${this.p(value)}`;
  }

  eq(col: string, v: unknown) { this.wheres.push(this.cond(col, "eq", v)); return this; }
  neq(col: string, v: unknown) { this.wheres.push(this.cond(col, "neq", v)); return this; }
  gt(col: string, v: unknown) { this.wheres.push(this.cond(col, "gt", v)); return this; }
  gte(col: string, v: unknown) { this.wheres.push(this.cond(col, "gte", v)); return this; }
  lt(col: string, v: unknown) { this.wheres.push(this.cond(col, "lt", v)); return this; }
  lte(col: string, v: unknown) { this.wheres.push(this.cond(col, "lte", v)); return this; }
  like(col: string, v: unknown) { this.wheres.push(this.cond(col, "like", v)); return this; }
  ilike(col: string, v: unknown) { this.wheres.push(this.cond(col, "ilike", v)); return this; }
  is(col: string, v: unknown) { this.wheres.push(this.cond(col, "is", v)); return this; }
  in(col: string, v: unknown[]) { this.wheres.push(this.cond(col, "in", v)); return this; }
  contains(col: string, v: unknown) { this.wheres.push(this.cond(col, "contains", v)); return this; }
  filter(col: string, op: string, v: unknown) { this.wheres.push(this.cond(col, op, v)); return this; }

  not(col: string, op: string, value: unknown) {
    if (op === "is" && value === null) {
      this.wheres.push(`base.${qi(col)} IS NOT NULL`);
    } else {
      this.wheres.push(`NOT (${this.cond(col, op, value)})`);
    }
    return this;
  }

  match(obj: Record<string, unknown>) {
    for (const [col, v] of Object.entries(obj)) this.eq(col, v);
    return this;
  }

  /** Gramática PostgREST: "col.op.valor,col.op.valor" (sem aninhamento). */
  or(expr: string) {
    const parts = expr.split(",").map((seg) => {
      const [col, op, ...rest] = seg.split(".");
      const value = rest.join(".");
      if (op === "is" && value === "null") return `base.${qi(col)} IS NULL`;
      return this.cond(col, op, value);
    });
    this.wheres.push(`(${parts.join(" OR ")})`);
    return this;
  }

  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) {
    const dir = opts?.ascending === false ? "DESC" : "ASC";
    const nulls =
      opts?.nullsFirst === true ? " NULLS FIRST" : opts?.nullsFirst === false ? " NULLS LAST" : "";
    this.orders.push(`base.${qi(col)} ${dir}${nulls}`);
    return this;
  }

  limit(n: number) { this.limitN = n; return this; }

  range(from: number, to: number) {
    this.offsetN = from;
    this.limitN = to - from + 1;
    return this;
  }

  single() { this.singleMode = "single"; return this; }
  maybeSingle() { this.singleMode = "maybeSingle"; return this; }

  // ——— geração de SQL ———

  private parseSelect(): { exprs: string[]; embeds: Embed[] } {
    const exprs: string[] = [];
    const embeds: Embed[] = [];
    let depth = 0;
    let cur = "";
    const segs: string[] = [];
    for (const ch of this.cols) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        segs.push(cur);
        cur = "";
      } else cur += ch;
    }
    if (cur.trim()) segs.push(cur);

    for (const raw of segs) {
      const seg = raw.trim();
      const m = seg.match(/^([a-zA-Z_]+)(?::([a-zA-Z_]+))?\(([^)]*)\)$/);
      if (m) {
        const [, name, fkHint, colList] = m;
        const cols = colList.split(",").map((c) => c.trim()).filter(Boolean);
        if (fkHint) {
          embeds.push({ alias: name, table: FK_TARGETS[fkHint] ?? name, fk: fkHint, cols });
        } else {
          embeds.push({ alias: name, table: name, fk: conventionFk(name), cols });
        }
      } else if (seg === "*") {
        exprs.push("base.*");
      } else {
        exprs.push(`base.${qi(seg)}`);
      }
    }
    return { exprs, embeds };
  }

  private buildSelectSql(): string {
    const { exprs, embeds } = this.parseSelect();
    const where = this.wheres.length ? ` WHERE ${this.wheres.join(" AND ")}` : "";

    if (this.head && this.countMode) {
      return `SELECT COUNT(*) AS __total FROM ${qi(this.table)} base${where}`;
    }

    const joins: string[] = [];
    const selectList = [...exprs];
    embeds.forEach((e, i) => {
      const j = `_j${i}`;
      joins.push(`LEFT JOIN ${qi(e.table)} ${j} ON ${j}."id" = base.${qi(e.fk)}`);
      const fields = e.cols.map((c) => `'${c}', ${j}.${qi(c)}`).join(", ");
      selectList.push(
        `CASE WHEN base.${qi(e.fk)} IS NULL THEN NULL ELSE json_build_object(${fields}) END AS ${qi(e.alias)}`
      );
    });
    if (this.countMode) selectList.push("COUNT(*) OVER() AS __total");

    let sql = `SELECT ${selectList.join(", ")} FROM ${qi(this.table)} base`;
    if (joins.length) sql += ` ${joins.join(" ")}`;
    sql += where;
    if (this.orders.length) sql += ` ORDER BY ${this.orders.join(", ")}`;
    if (this.limitN !== null) sql += ` LIMIT ${this.limitN}`;
    if (this.offsetN !== null) sql += ` OFFSET ${this.offsetN}`;
    return sql;
  }

  /** Valores de linha (INSERT/UPDATE/UPSERT): arrays JS viram JSON string —
   *  o driver pg converte array para literal '{...}' (array Postgres), que
   *  quebra colunas jsonb (ex.: faq_json → "invalid input syntax for type
   *  json"). Objetos puros o pg já serializa como JSON. Sem colunas array
   *  nativas neste schema, então o stringify é sempre o comportamento certo
   *  (paridade com supabase-js/PostgREST). */
  private rowValue(v: unknown): unknown {
    return Array.isArray(v) ? JSON.stringify(v) : v;
  }

  private buildMutationSql(): string {
    const returning = this.wantRows ? " RETURNING *" : "";

    if (this.mode === "delete") {
      const where = this.wheres.length ? ` WHERE ${this.wheres.join(" AND ")}` : "";
      return `DELETE FROM ${qi(this.table)} base${where}${returning}`;
    }

    if (this.mode === "update") {
      // Params do SET vêm antes dos do WHERE ($1..$n), como no SQL gerado —
      // os filtros foram encadeados depois do update(), então renumeramos.
      const entries = Object.entries(this.values[0]);
      const shift = entries.length;
      const wheres = this.wheres.map((w) =>
        w.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + shift}`)
      );
      this.params = [...entries.map(([, v]) => this.rowValue(v)), ...this.params];
      const sets = entries.map(([c], i) => `${qi(c)} = $${i + 1}`);
      const where = wheres.length ? ` WHERE ${wheres.join(" AND ")}` : "";
      return `UPDATE ${qi(this.table)} base SET ${sets.join(", ")}${where}${returning}`;
    }

    // insert / upsert
    const cols = Object.keys(this.values[0]);
    const rows = this.values.map(
      (row) => `(${cols.map((c) => this.p(this.rowValue(row[c]))).join(", ")})`
    );
    let sql = `INSERT INTO ${qi(this.table)} (${cols.map(qi).join(", ")}) VALUES ${rows.join(", ")}`;
    if (this.mode === "upsert" && this.conflict.length) {
      const updatable = cols.filter((c) => !this.conflict.includes(c));
      sql += ` ON CONFLICT (${this.conflict.map(qi).join(", ")}) DO UPDATE SET ${updatable
        .map((c) => `${qi(c)} = EXCLUDED.${qi(c)}`)
        .join(", ")}`;
    }
    return sql + returning;
  }

  private async run(): Promise<ShimResponse> {
    try {
      // WHERE dos filtros já foi acumulado ANTES do SET no caso do update —
      // reordenamos os params: SET primeiro, depois WHERE (contrato dos testes
      // e paridade com a ordem de leitura do SQL gerado).
      const sql = this.mode === "select" ? this.buildSelectSql() : this.buildMutationSql();
      const { rows } = await this.query(sql, this.params);

      let count: number | null = null;
      let data: unknown = rows;

      if (this.countMode) {
        count = rows.length ? Number(rows[0].__total) : 0;
        if (this.head) {
          data = null;
        } else {
          data = rows.map(({ __total: _t, ...rest }) => rest);
        }
      }

      if (this.mode !== "select" && !this.wantRows) data = null;

      if (this.singleMode) {
        const arr = data as Record<string, unknown>[] | null;
        if (!arr || arr.length === 0) {
          if (this.singleMode === "single") {
            return {
              data: null,
              error: {
                message: "JSON object requested, multiple (or no) rows returned",
                code: "PGRST116",
                details: "Results contain 0 rows",
              },
              count,
            };
          }
          return { data: null, error: null, count };
        }
        if (arr.length > 1) {
          return {
            data: null,
            error: {
              message: "JSON object requested, multiple (or no) rows returned",
              code: "PGRST116",
              details: `Results contain ${arr.length} rows`,
            },
            count,
          };
        }
        data = arr[0];
      }

      return { data, error: null, count };
    } catch (err) {
      const e = err as Error & { code?: string; detail?: string };
      return {
        data: null,
        error: { message: e.message, code: e.code ?? "SHIM_ERROR", details: e.detail ?? null },
        count: null,
      };
    }
  }

  then<T1 = ShimResponse, T2 = never>(
    onfulfilled?: ((value: ShimResponse) => T1 | PromiseLike<T1>) | null,
    onrejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null
  ): PromiseLike<T1 | T2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

export function createPgClient(query: QueryFn) {
  return {
    from(table: string) {
      return new PgQueryBuilder(table, query);
    },
  };
}

/** Tipo do client do shim — substitui SupabaseClient nos módulos server. */
export type DbClient = ReturnType<typeof createPgClient>;
