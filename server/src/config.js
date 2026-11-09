const config = {
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  isProduction: process.env.NODE_ENV === "production",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  appUrl: process.env.APP_URL,
};

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL mancante");
}

if (!config.jwtSecret) {
  throw new Error("JWT_SECRET mancante");
}

if (!config.googleClientId) {
  throw new Error("GOOGLE_CLIENT_ID mancante");
}

if (!config.googleClientSecret) {
  throw new Error("GOOGLE_CLIENT_SECRET mancante");
}

if (!config.appUrl) {
  throw new Error("APP_URL mancante");
}

export default config;
