export default {
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_FLVm6ZatozC3@ep-spring-mountain-a8qnycq6-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
    connectionString:
      "postgresql://neondb_owner:npg_FLVm6ZatozC3@ep-spring-mountain-a8qnycq6-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
  },
};
