const {{MODULE_UPPER}} = {
  ROOT: "{{ROUTE}}",
  DETAIL: (id: string) => `{{ROUTE}}/${id}`,
  CREATE: "{{ROUTE}}/new",
} as const;
