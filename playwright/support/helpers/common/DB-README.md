# Datastore layer (L4) — wiring

The harness ships the **contract**, not the driver. `profile.datastore.driver` says which database
the project uses; a boilerplate that picked for you would be wrong for every project that picked
differently.

## 1. Declare it in the profile

```json
"datastore": {
  "driver": "postgres",
  "access": "direct",
  "credentialSource": "DB_READONLY_URL",
  "readOnly": true
}
```

`harness:ready` refuses a reachable datastore with no `credentialSource`, and refuses write-capable
access with neither `readOnly: true` nor a recorded `writeApproval`. The credential itself never
enters the repository — only the name of the env var or secret that holds it.

## 2. Install the driver in the project

Not a harness dependency. `pg`, `mysql2`, `mssql`, `oracledb` — whichever the profile declares.

## 3. Register the fixture

Unlike Cypress, a Playwright test already runs in Node, so it calls the driver directly — no task,
no IPC. Add a **worker-scoped** fixture so one pool serves every test in the worker rather than one
connection per test:

```ts
// playwright/fixtures/base.fixture.ts — sketch, not a drop-in.
import { DbHelpers, type QueryRunner } from "../support/helpers/common/db.helpers";

type WorkerFixtures = { db: DbHelpers };

export const test = base.extend<CustomFixtures, WorkerFixtures>({
  db: [
    async ({}, use) => {
      // Connection string from the env var named by profile.datastore.credentialSource.
      // A least-privilege, read-only user unless writes are separately approved.
      const pool = createPoolInYourDriver(process.env.DB_READONLY_URL);
      const run: QueryRunner = async (sql, params) => bindAndQuery(pool, sql, params);

      await use(new DbHelpers(run));

      await pool.end(); // worker teardown — not per test
    },
    { scope: "worker" },
  ],
});
```

Two things the runner must get right:

- **Bind, never interpolate.** `parameterNames(sql)` maps `:id` to `$1` / `?` / `@id` without every
  caller learning the driver's style. Concatenating a query turns a verification test into an
  injection vector against the database it verifies.
- **One pool per worker, closed at teardown.** A pool per test exhausts connections on any real suite.

## 4. Use it

```ts
import { ORDERS_DB } from "../../configs/db/modules/orders/orders.db";

test("[ORD-014] settled order persists its total", { tag: ["@ORD-014"] }, async ({ db }) => {
  const row = await db.row(ORDERS_DB.FIND_ORDER_BY_ID, { id: orderId });
  expect(row.status).toBe("SETTLED");
  expect(row.total_minor).toBe(10045); // minor units — never a float round-trip
});
```

| Method                    | Returns                                            |
| ------------------------- | -------------------------------------------------- |
| `db.query(entry, params)` | all rows                                           |
| `db.row(entry, params)`   | the one row, throwing on 0 or 2+                   |
| `db.count(entry, params)` | the single aggregate value, normalised to a number |

`db.row` throwing on zero rows is deliberate. A query that quietly matches nothing is the most
common false pass at this layer: the assertion never runs and the test goes green having proved the
row's absence.

## Rules that apply here

| Rule                    | Effect                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `no-sql-literal`        | SQL in a spec or helper is refused at write time — it belongs in `playwright/configs/db/**` |
| `smoke-read-only`       | `INSERT` / `UPDATE` / `DELETE` / `TRUNCATE` / `DROP` / `ALTER` in a smoke spec is refused   |
| `no-credential-literal` | A connection string written as a literal is refused                                         |

What to cover once this is wired: [`docs/backend-testing-coverage.md`](../../../../docs/backend-testing-coverage.md).
