import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.POSTGRES_CONNECTION_STRING;

if (!connectionString) {
  throw new Error(
    "POSTGRES_CONNECTION_STRING is not defined in environment variables"
  );
}

// Create Sequelize instance with connection string
export const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Neon requires SSL
    },
    connectTimeout: 60000, // 60 seconds timeout
  },
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 16, // Increased for better connection handling
    min: 0,
    acquire: 60000, // 60 seconds to acquire connection
    idle: 10000,
  },
});

// Test the connection
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    throw error;
  }
};
