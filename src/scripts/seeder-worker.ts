import { parentPort, workerData } from "worker_threads";
import { Sequelize } from "sequelize";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";

dotenv.config();

interface WorkerData {
  connectionString: string;
  entityType: "institutes" | "students" | "courses" | "results";
  startIndex: number;
  count: number;
  relatedData?: any;
}

const grades = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "F",
];

const gradeToScore = (grade: string): number => {
  const gradeMap: { [key: string]: number } = {
    "A+": faker.number.float({ min: 95, max: 100, precision: 0.01 }),
    A: faker.number.float({ min: 90, max: 94.99, precision: 0.01 }),
    "A-": faker.number.float({ min: 85, max: 89.99, precision: 0.01 }),
    "B+": faker.number.float({ min: 80, max: 84.99, precision: 0.01 }),
    B: faker.number.float({ min: 75, max: 79.99, precision: 0.01 }),
    "B-": faker.number.float({ min: 70, max: 74.99, precision: 0.01 }),
    "C+": faker.number.float({ min: 65, max: 69.99, precision: 0.01 }),
    C: faker.number.float({ min: 60, max: 64.99, precision: 0.01 }),
    "C-": faker.number.float({ min: 55, max: 59.99, precision: 0.01 }),
    "D+": faker.number.float({ min: 50, max: 54.99, precision: 0.01 }),
    D: faker.number.float({ min: 45, max: 49.99, precision: 0.01 }),
    F: faker.number.float({ min: 0, max: 44.99, precision: 0.01 }),
  };
  return gradeMap[grade] || 0;
};

async function seedWorker() {
  const { connectionString, entityType, count, relatedData } =
    workerData as WorkerData;

  const sequelize = new Sequelize(connectionString, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });

  try {
    await sequelize.authenticate();

    const BATCH_SIZE = 1000;
    let inserted = 0;

    for (let i = 0; i < count; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, count - i);
      const data: any[] = [];

      for (let j = 0; j < batchSize; j++) {
        switch (entityType) {
          case "institutes":
            data.push({
              id: faker.string.uuid(),
              name: faker.company.name() + " Institute",
              location: faker.location.city() + ", " + faker.location.state(),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            break;

          case "students":
            data.push({
              id: faker.string.uuid(),
              name: faker.person.fullName(),
              email: faker.internet.email().toLowerCase(),
              instituteId: faker.helpers.arrayElement(relatedData.instituteIds),
              userId: faker.string.uuid(), // Placeholder, will be updated later
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            break;

          case "courses":
            data.push({
              id: faker.string.uuid(),
              title:
                faker.helpers.arrayElement([
                  "Computer Science",
                  "Mathematics",
                  "Physics",
                  "Chemistry",
                  "Biology",
                  "English Literature",
                  "History",
                  "Economics",
                  "Psychology",
                  "Sociology",
                ]) +
                " " +
                faker.number.int({ min: 100, max: 499 }),
              code:
                "COURSE-" +
                faker.string.alphanumeric({ length: 6, casing: "upper" }),
              credits: faker.helpers.arrayElement([2, 3, 4]),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            break;

          case "results":
            const grade = faker.helpers.arrayElement(grades);
            data.push({
              id: faker.string.uuid(),
              studentId: faker.helpers.arrayElement(relatedData.studentIds),
              courseId: faker.helpers.arrayElement(relatedData.courseIds),
              score: gradeToScore(grade),
              grade,
              year: faker.helpers.arrayElement([2020, 2021, 2022, 2023, 2024]),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            break;
        }
      }

      await sequelize.query(
        `INSERT INTO "${entityType}" (${Object.keys(data[0])
          .map((key) => `"${key}"`)
          .join(", ")}) VALUES ${data
          .map(
            () =>
              `(${Object.keys(data[0])
                .map(() => "?")
                .join(", ")})`
          )
          .join(", ")}`,
        {
          replacements: data.flatMap((item) => Object.values(item)),
        }
      );

      inserted += batchSize;

      // Report progress
      if (parentPort) {
        parentPort.postMessage({ type: "progress", inserted, total: count });
      }
    }

    await sequelize.close();

    if (parentPort) {
      parentPort.postMessage({ type: "complete", inserted });
    }
  } catch (error: any) {
    if (parentPort) {
      parentPort.postMessage({ type: "error", error: error.message });
    }
    await sequelize.close();
    process.exit(1);
  }
}

seedWorker();
