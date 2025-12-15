import { GraphQLError } from "graphql";
import { Institute, Student } from "../../models";
import { requireAuth } from "../../middleware/auth";
import { getPaginationParams, paginate } from "../../utils/pagination";

export const instituteResolvers = {
  Query: {
    institute: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const institute = await Institute.findByPk(id, {
        include: [{ model: Student, as: "students" }],
      });
      if (!institute) {
        throw new GraphQLError("Institute not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return institute;
    },

    institutes: async (_: any, args: any) => {
      const { limit, offset } = getPaginationParams(args);
      const { search } = args;

      // Build where clause for search
      const where: any = {};
      if (search) {
        const { Op } = require("sequelize");
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { location: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Institute.findAndCountAll({
        where,
        limit,
        offset,
        order: [["name", "ASC"]],
      });

      return paginate(rows, count, limit, offset);
    },
  },

  Mutation: {
    createInstitute: async (_: any, { input }: any, context: any) => {
      requireAuth(context);
      return await Institute.create(input);
    },

    updateInstitute: async (_: any, { id, input }: any, context: any) => {
      requireAuth(context);
      const institute = await Institute.findByPk(id);
      if (!institute) {
        throw new GraphQLError("Institute not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      await institute.update(input);
      return institute;
    },

    deleteInstitute: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const institute = await Institute.findByPk(id);
      if (!institute) {
        throw new GraphQLError("Institute not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      await institute.destroy();
      return true;
    },
  },

  Institute: {
    students: async (parent: any) => {
      return await Student.findAll({ where: { instituteId: parent.id } });
    },
  },
};
