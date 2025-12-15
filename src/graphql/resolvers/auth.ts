import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { User, Student, Institute } from "../../models";
import { jwtConfig } from "../../config/auth";
import { AuthContext } from "../../middleware/auth";

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, context: AuthContext) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      return await User.findByPk(context.user.id, {
        include: [{ model: Student, as: "student" }],
      });
    },
  },

  Mutation: {
    signUp: async (_: any, { input }: any) => {
      const { email, password, name, instituteId } = input;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new GraphQLError("User with this email already exists", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Check if institute exists
      const institute = await Institute.findByPk(instituteId);
      if (!institute) {
        throw new GraphQLError("Institute not found", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        role: "student",
      });

      // Create student profile
      await Student.create({
        name,
        email,
        instituteId,
        userId: user.id,
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtConfig.secret,
        {
          expiresIn: jwtConfig.expiresIn,
        } as jwt.SignOptions
      );

      return { token, user };
    },

    signIn: async (_: any, { input }: any) => {
      const { email, password } = input;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtConfig.secret,
        {
          expiresIn: jwtConfig.expiresIn,
        } as jwt.SignOptions
      );

      return { token, user };
    },
  },

  User: {
    student: async (parent: any) => {
      return await Student.findOne({ where: { userId: parent.id } });
    },
  },
};
