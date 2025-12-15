import { authResolvers } from "./auth";
import { instituteResolvers } from "./institute";
import { studentResolvers } from "./student";
import { courseResolvers } from "./course";
import { resultResolvers } from "./result";
import { analyticsResolvers } from "./analytics";

// Merge all resolvers
export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...instituteResolvers.Query,
    ...studentResolvers.Query,
    ...courseResolvers.Query,
    ...resultResolvers.Query,
    ...analyticsResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...instituteResolvers.Mutation,
    ...studentResolvers.Mutation,
    ...courseResolvers.Mutation,
    ...resultResolvers.Mutation,
  },
  User: authResolvers.User,
  Institute: instituteResolvers.Institute,
  Student: studentResolvers.Student,
  Course: courseResolvers.Course,
  Result: resultResolvers.Result,
};
