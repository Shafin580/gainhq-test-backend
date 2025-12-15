import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { testConnection, sequelize } from "./config/database";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { verifyToken, AuthContext } from "./middleware/auth";

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = express();

  // Test database connection
  await testConnection();

  // Initialize Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());

  // GraphQL endpoint with authentication context
  app.use(
    "/graphql",
    expressMiddleware(apolloServer, {
      context: async ({ req }): Promise<AuthContext> => {
        const token = req.headers.authorization?.replace("Bearer ", "");

        if (token) {
          try {
            const decoded = verifyToken(token);
            return { user: decoded };
          } catch (error) {
            // Invalid token, continue without user context
            return {};
          }
        }

        return {};
      },
    })
  );

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  // Root endpoint
  app.get("/", (_req, res) => {
    res.json({
      message: "GainHQ Backend API",
      graphql: `http://localhost:${PORT}/graphql`,
      health: `http://localhost:${PORT}/health`,
    });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
  });
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n⏹️  Shutting down gracefully...");
  await sequelize.close();
  process.exit(0);
});

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
