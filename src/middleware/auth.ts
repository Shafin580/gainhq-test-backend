import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/auth";

export interface AuthContext {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    throw new GraphQLError("Invalid or expired token", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
};

export const requireAuth = (context: AuthContext): void => {
  if (!context.user) {
    throw new GraphQLError("Authentication required", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
};

export const requireAdmin = (context: AuthContext): void => {
  requireAuth(context);
  if (context.user!.role !== "admin") {
    throw new GraphQLError("Admin access required", {
      extensions: { code: "FORBIDDEN" },
    });
  }
};
