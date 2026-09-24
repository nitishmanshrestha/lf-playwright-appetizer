/**
 * Datastore query contract — template.
 *
 * Copy to `playwright/configs/db/modules/<module>/<module>.db.ts`. Queries live here for the same
 * reason routes live in `configs/app`: a query is the datastore's contract, and one schema change
 * should mean one config edit rather than a grep across specs. The `no-sql-literal` rule refuses a
 * SQL literal written anywhere else.
 *
 * Rules for every entry:
 *
 * - **Named parameters, never interpolation.** `WHERE id = :id`, not `WHERE id = ${id}`. The driver
 *   binds them. String-building a query is how a test becomes an injection vector against the very
 *   database it is meant to verify.
 * - **Select the columns you assert.** `SELECT *` makes the test pass through a column rename that
 *   should have failed it.
 * - **`mutates` is declared, not inferred.** It documents intent so a reviewer sees write capability
 *   without parsing SQL. Enforcement is separate: `smoke-read-only` refuses write SQL in a smoke
 *   spec at write time.
 * - **No credentials here.** Connection details come from `profile.datastore.credentialSource`.
 */
import type { QueryEntry } from "../../../support/helpers/common/db.helpers";

export const EXAMPLE_DB = Object.freeze({
  FIND_ORDER_BY_ID: Object.freeze<QueryEntry>({
    name: "orders.findById",
    sql: "SELECT id, customer_id, total_minor, currency, status FROM orders WHERE id = :id",
    mutates: false,
  }),

  COUNT_ORDER_LINES: Object.freeze<QueryEntry>({
    name: "orders.countLines",
    sql: "SELECT COUNT(*) AS line_count FROM order_lines WHERE order_id = :orderId",
    mutates: false,
  }),

  // Monetary values are read as minor units on purpose. A float round-trip through the driver can
  // return 100.44999999999999 for a stored 100.45, and the test then encodes the defect it exists
  // to catch. Assert integers, or a decimal type the driver preserves exactly.
  SUM_ORDER_LINE_TOTALS: Object.freeze<QueryEntry>({
    name: "orders.sumLineTotals",
    sql: "SELECT SUM(amount_minor) AS lines_total_minor FROM order_lines WHERE order_id = :orderId",
    mutates: false,
  }),

  // A write entry is legal in the e2e tier when the project has approved datastore writes
  // (`profile.datastore.writeApproval`). Prefer seeding through the application's own API so its
  // business rules run; a raw insert proves the read path against data the application would never
  // have produced.
  DELETE_SYNTHETIC_ORDER: Object.freeze<QueryEntry>({
    name: "orders.deleteSynthetic",
    sql: "DELETE FROM orders WHERE id = :id AND customer_id = :syntheticCustomerId",
    mutates: true,
  }),
});
