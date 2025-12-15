import { GraphQLError } from "graphql";
import { Course, Result } from "../../models";
import { requireAuth } from "../../middleware/auth";
import { getPaginationParams, paginate } from "../../utils/pagination";

export const courseResolvers = {
  Query: {
    course: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const course = await Course.findByPk(id, {
        include: [{ model: Result, as: "results" }],
      });
      if (!course) {
        throw new GraphQLError("Course not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return course;
    },

    courses: async (_: any, args: any, context: any) => {
      requireAuth(context);
      const { limit, offset } = getPaginationParams(args);
      const { search } = args;

      // Build where clause for search
      const where: any = {};
      if (search) {
        const { Op } = require("sequelize");
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Course.findAndCountAll({
        where,
        limit,
        offset,
        order: [["code", "ASC"]],
      });

      return paginate(rows, count, limit, offset);
    },
  },

  Mutation: {
    createCourse: async (_: any, { input }: any, context: any) => {
      requireAuth(context);

      // Check if course code already exists
      const existingCourse = await Course.findOne({
        where: { code: input.code },
      });
      if (existingCourse) {
        throw new GraphQLError("Course with this code already exists", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      return await Course.create(input);
    },

    updateCourse: async (_: any, { id, input }: any, context: any) => {
      requireAuth(context);
      const course = await Course.findByPk(id);
      if (!course) {
        throw new GraphQLError("Course not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      // Check if new code conflicts with existing course
      if (input.code && input.code !== course.code) {
        const existingCourse = await Course.findOne({
          where: { code: input.code },
        });
        if (existingCourse) {
          throw new GraphQLError("Course with this code already exists", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      await course.update(input);
      return course;
    },

    deleteCourse: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const course = await Course.findByPk(id);
      if (!course) {
        throw new GraphQLError("Course not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      await course.destroy();
      return true;
    },
  },

  Course: {
    results: async (parent: any) => {
      return await Result.findAll({ where: { courseId: parent.id } });
    },
  },
};
