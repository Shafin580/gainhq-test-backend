import { GraphQLError } from "graphql";
import { Student, Institute, User, Result } from "../../models";
import { requireAuth } from "../../middleware/auth";
import { getPaginationParams, paginate } from "../../utils/pagination";

export const studentResolvers = {
  Query: {
    student: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const student = await Student.findByPk(id, {
        include: [
          { model: Institute, as: "institute" },
          { model: User, as: "user" },
          { model: Result, as: "results" },
        ],
      });
      if (!student) {
        throw new GraphQLError("Student not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return student;
    },

    students: async (_: any, args: any, context: any) => {
      requireAuth(context);
      const { limit, offset } = getPaginationParams(args);
      const { search } = args;

      // Build where clause for search
      const where: any = {};
      if (search) {
        const { Op } = require("sequelize");
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Student.findAndCountAll({
        where,
        limit,
        offset,
        order: [["name", "ASC"]],
        include: [{ model: Institute, as: "institute" }],
      });

      return paginate(rows, count, limit, offset);
    },
  },

  Mutation: {
    createStudent: async (_: any, { input }: any, context: any) => {
      requireAuth(context);

      // Verify institute exists
      const institute = await Institute.findByPk(input.instituteId);
      if (!institute) {
        throw new GraphQLError("Institute not found", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Verify user exists
      const user = await User.findByPk(input.userId);
      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      return await Student.create(input);
    },

    updateStudent: async (_: any, { id, input }: any, context: any) => {
      requireAuth(context);
      const student = await Student.findByPk(id);
      if (!student) {
        throw new GraphQLError("Student not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      await student.update(input);
      return student;
    },

    deleteStudent: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const student = await Student.findByPk(id);
      if (!student) {
        throw new GraphQLError("Student not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      await student.destroy();
      return true;
    },
  },

  Student: {
    institute: async (parent: any) => {
      return await Institute.findByPk(parent.instituteId);
    },
    user: async (parent: any) => {
      return await User.findByPk(parent.userId);
    },
    results: async (parent: any) => {
      return await Result.findAll({ where: { studentId: parent.id } });
    },
  },
};
