const config = {
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  isProduction: process.env.NODE_ENV === "production",
};

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL mancante");
}

if (!config.jwtSecret) {
  throw new Error("JWT_SECRET mancante");
}

export default config;
