/**
 * Datastore helpers — the L4 access layer.
 *
 * A Playwright test already runs in Node, so it talks to the driver directly. There is no task
 * indirection and no IPC serialisation step; that is the one real difference from the Cypress
 * adapter, where the test lives in a browser sandbox that cannot open a database socket.
 *
 * The driver is deliberately not shipped. `profile.datastore.driver` declares which one the project
 * uses, and a boilerplate that picked would be wrong for every project that picked differently. A
 * project supplies a `QueryRunner` when it registers the fixture — see README.md in this directory.
 */

/** One entry from `playwright/configs/db/**`. Never raw SQL from a spec. */
export interface QueryEntry {
  readonly name: string;
  readonly sql: string;
  readonly mutates: boolean;
}

export type QueryParams = Record<string, unknown>;
export type Row = Record<string, unknown>;

/** What a project's driver adapter must provide. Binds parameters; never interpolates. */
export type QueryRunner = (sql: string, params: QueryParams) => Promise<Row[]>;

const PARAM_RE = /:(\w+)/g;

/**
 * Named parameters the SQL expects, so a project's runner can map `:id` to `$1` / `?` / `@id`
 * without every caller learning the driver's style.
 */
export function parameterNames(sql: string): string[] {
  return [...new Set([...String(sql).matchAll(PARAM_RE)].map((m) => m[1]))];
}

export function assertQueryEntry(entry: QueryEntry): void {
  if (!entry?.name || !entry?.sql) {
    throw new Error(
      "db requires a query entry with `name` and `sql` from playwright/configs/db/**. " +
        "Passing raw SQL is refused by the no-sql-literal rule.",
    );
  }
  if (typeof entry.mutates !== "boolean") {
    throw new Error(
      `query "${entry.name}" must declare mutates: true|false — a reviewer should see write ` +
        "capability without reading the SQL.",
    );
  }
}

export class DbHelpers {
  constructor(private readonly run: QueryRunner) {}

  /** All rows. */
  async query(entry: QueryEntry, params: QueryParams = {}): Promise<Row[]> {
    assertQueryEntry(entry);
    // Fail here rather than in the driver. An unbound parameter reaches most drivers as a null and
    // the query returns zero rows — a green test that proved nothing.
    const missing = parameterNames(entry.sql).filter(
      (name) => !Object.prototype.hasOwnProperty.call(params, name),
    );
    if (missing.length > 0) {
      throw new Error(`query "${entry.name}" is missing bound parameter(s): ${missing.join(", ")}`);
    }
    return this.run(entry.sql, params);
  }

  /**
   * The one row a query must return.
   *
   * Failing on zero rows is deliberate: a query that quietly matches nothing is the most common
   * false pass at this layer — the assertion never runs and the test goes green having proved the
   * row's absence.
   */
  async row(entry: QueryEntry, params: QueryParams = {}): Promise<Row> {
    const rows = await this.query(entry, params);
    if (rows.length !== 1) {
      throw new Error(`query "${entry.name}" must match exactly one row (matched ${rows.length})`);
    }
    return rows[0];
  }

  /** The single aggregate value of a COUNT/SUM query, normalised across drivers. */
  async count(entry: QueryEntry, params: QueryParams = {}): Promise<number> {
    const row = await this.row(entry, params);
    const values = Object.values(row);
    if (values.length !== 1) {
      throw new Error(`query "${entry.name}" must select exactly one aggregate column`);
    }
    // Drivers disagree about the type of COUNT/SUM: node-postgres returns bigint as a string,
    // mysql2 and mssql return numbers. Normalise once here, and reject a non-numeric result rather
    // than coercing NaN into an assertion that then compares against nothing.
    const numeric = Number(values[0]);
    if (!Number.isFinite(numeric)) {
      throw new Error(
        `query "${entry.name}" returned a non-numeric aggregate: ${JSON.stringify(values[0])}`,
      );
    }
    return numeric;
  }
}
