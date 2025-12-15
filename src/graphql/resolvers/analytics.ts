import { Institute, Student, Course, Result } from "../../models";
import { requireAuth } from "../../middleware/auth";
import { sequelize } from "../../config/database";

export const analyticsResolvers = {
  Query: {
    // Get all data with complete relationships
    allData: async (_: any, __: any, context: any) => {
      requireAuth(context);
      return await Institute.findAll({
        include: [
          {
            model: Student,
            as: "students",
            include: [
              {
                model: Result,
                as: "results",
                include: [{ model: Course, as: "course" }],
              },
            ],
          },
        ],
        order: [["name", "ASC"]],
      });
    },

    // Get results per institute with aggregations
    resultsPerInstitute: async (_: any, { instituteId }: any, context: any) => {
      requireAuth(context);

      const whereClause = instituteId ? { id: instituteId } : {};

      const institutes = await Institute.findAll({
        where: whereClause,
        attributes: ["id", "name", "location", "createdAt", "updatedAt"],
        limit: instituteId ? undefined : 10, // Limit to 10 institutes when fetching all
        include: [
          {
            model: Student,
            as: "students",
            attributes: ["id", "name", "email"],
            include: [
              {
                model: Result,
                as: "results",
                attributes: [
                  "id",
                  "score",
                  "grade",
                  "year",
                  "createdAt",
                  "updatedAt",
                ],
                include: [
                  {
                    model: Course,
                    as: "course",
                    attributes: ["id", "title", "code", "credits"],
                  },
                ],
              },
            ],
          },
        ],
      });

      return institutes.map((institute: any) => {
        const allResults: any[] = [];
        let totalScore = 0;

        // Convert to plain object and aggregate results
        const instituteData = institute.toJSON();

        if (instituteData.students && Array.isArray(instituteData.students)) {
          instituteData.students.forEach((student: any) => {
            if (student.results && Array.isArray(student.results)) {
              student.results.forEach((result: any) => {
                // Add student reference to each result
                allResults.push({
                  ...result,
                  student: {
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    institute: {
                      id: instituteData.id,
                      name: instituteData.name,
                      location: instituteData.location,
                    },
                  },
                });
                totalScore += parseFloat(result.score);
              });
            }
          });
        }

        return {
          institute: {
            id: instituteData.id,
            name: instituteData.name,
            location: instituteData.location,
          },
          results: allResults,
          averageScore:
            allResults.length > 0 ? totalScore / allResults.length : 0,
          totalStudents: instituteData.students?.length || 0,
        };
      });
    },

    // Get top courses by enrollment for a specific year
    topCourses: async (_: any, { year, limit = 10 }: any, context: any) => {
      requireAuth(context);

      const results = await Result.findAll({
        where: { year },
        attributes: [
          "courseId",
          [
            sequelize.fn("COUNT", sequelize.col("Result.id")),
            "enrollmentCount",
          ],
        ],
        include: [
          {
            model: Course,
            as: "course",
            attributes: [],
          },
        ],
        group: ["Result.courseId", "course.id"],
        order: [[sequelize.literal('"enrollmentCount"'), "DESC"]],
        limit,
        raw: false,
      });

      // Fetch full course details for each result
      const topCoursesWithDetails = await Promise.all(
        results.map(async (result: any) => {
          const course = await Course.findByPk(result.courseId);
          return {
            course,
            enrollmentCount: parseInt(result.get("enrollmentCount") as string),
            year,
          };
        })
      );

      return topCoursesWithDetails;
    },

    // Get top students by cumulative score
    topStudents: async (_: any, { limit = 10 }: any, context: any) => {
      requireAuth(context);

      const results = await Result.findAll({
        attributes: [
          "studentId",
          [sequelize.fn("SUM", sequelize.col("score")), "totalScore"],
          [sequelize.fn("AVG", sequelize.col("score")), "averageScore"],
          [sequelize.fn("COUNT", sequelize.col("Result.id")), "resultCount"],
        ],
        include: [
          {
            model: Student,
            as: "student",
            attributes: [],
          },
        ],
        group: ["Result.studentId", "student.id"],
        order: [[sequelize.literal('"totalScore"'), "DESC"]],
        limit,
        raw: false,
      });

      // Fetch full student details
      const topStudentsWithDetails = await Promise.all(
        results.map(async (result: any) => {
          const student = await Student.findByPk(result.studentId, {
            include: [{ model: Institute, as: "institute" }],
          });
          return {
            student,
            totalScore: parseFloat(result.get("totalScore") as string),
            averageScore: parseFloat(result.get("averageScore") as string),
            resultCount: parseInt(result.get("resultCount") as string),
          };
        })
      );

      return topStudentsWithDetails;
    },
  },
};
