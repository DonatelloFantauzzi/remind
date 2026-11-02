const config = {
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT || 3000,
};

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL mancante");
}

export default config;
