import dotenv from "dotenv";

dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || "fallback-secret-key-change-me",
  expiresIn: process.env.JWT_EXPIRES_IN || "24h",
};

if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️  JWT_SECRET not set in environment variables. Using fallback (not secure for production)."
  );
}
