import { GraphQLError } from "graphql";
import { Result, Student, Course } from "../../models";
import { requireAuth } from "../../middleware/auth";
import { getPaginationParams, paginate } from "../../utils/pagination";

export const resultResolvers = {
  Query: {
    result: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const result = await Result.findByPk(id, {
        include: [
          { model: Student, as: "student" },
          { model: Course, as: "course" },
        ],
      });
      if (!result) {
        throw new GraphQLError("Result not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return result;
    },

    results: async (_: any, args: any, context: any) => {
      requireAuth(context);
      const { limit, offset } = getPaginationParams(args);
      const { year } = args;

      // Build where clause for year filter
      const where: any = {};
      if (year) {
        where.year = year;
      }

      // Note: Search functionality not implemented for results yet
      // Would require full-text search across related Student and Course tables

      const { count, rows } = await Result.findAndCountAll({
        where,
        limit,
        offset,
        order: [
          ["year", "DESC"],
          ["score", "DESC"],
        ],
        include: [
          { model: Student, as: "student" },
          { model: Course, as: "course" },
        ],
      });

      return paginate(rows, count, limit, offset);
    },
  },

  Mutation: {
    createResult: async (_: any, { input }: any, context: any) => {
      requireAuth(context);

      // Verify student exists
      const student = await Student.findByPk(input.studentId);
      if (!student) {
        throw new GraphQLError("Student not found", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Verify course exists
      const course = await Course.findByPk(input.courseId);
      if (!course) {
        throw new GraphQLError("Course not found", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      return await Result.create(input);
    },

    updateResult: async (_: any, { id, input }: any, context: any) => {
      requireAuth(context);
      const result = await Result.findByPk(id);
      if (!result) {
        throw new GraphQLError("Result not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      await result.update(input);
      return result;
    },

    deleteResult: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const result = await Result.findByPk(id);
      if (!result) {
        throw new GraphQLError("Result not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      await result.destroy();
      return true;
    },
  },

  Result: {
    student: async (parent: any) => {
      return await Student.findByPk(parent.studentId);
    },
    course: async (parent: any) => {
      return await Course.findByPk(parent.courseId);
    },
  },
};
