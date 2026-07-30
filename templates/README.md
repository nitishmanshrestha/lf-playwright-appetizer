# Templates Manifest

This folder contains template files used by the generator (when wired).

Each template documents required tokens and example values. The generator should perform simple token replacement using `{{TOKEN_NAME}}`.

Common tokens

- `MODULE` — module name, e.g. `example`
- `ROUTE` — route path, e.g. `/example`
- `MODULE_UPPER` — uppercase module name, e.g. `EXAMPLE`

When the generator is wired, it will look for templates under `templates/` and write output to the corresponding locations under `playwright/configs`, `playwright/support/helpers/modules`, `playwright/tests`, and `playwright/testdata`.

Template files in this repo
- `templates/module/routes.block.tpl`
- `templates/module/ui.ts.tpl`
- `templates/module/helpers.ts.tpl`
- `templates/module/smoke.spec.tpl`
- `templates/module/testdata.json.tpl`

