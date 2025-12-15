import { Worker } from "worker_threads";
import * as os from "os";
import * as path from "path";
import { sequelize } from "../config/database";
import { User, Institute, Student, Course, Result } from "../models";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const connectionString = process.env.POSTGRES_CONNECTION_STRING!;

// Detect available CPU cores
const CPU_COUNT = os.cpus().length;
// Conservative worker count for Neon free plan

console.log(`💻 Detected ${CPU_COUNT} CPU cores`);

function createWorker(
  entityType: string,
  startIndex: number,
  count: number,
  relatedData?: any
): Promise<void> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "seeder-worker.ts"), {
      execArgv: ["-r", "ts-node/register"],
      workerData: {
        connectionString,
        entityType,
        startIndex,
        count,
        relatedData,
      },
    });

    worker.on("message", (msg) => {
      if (msg.type === "progress") {
        process.stdout.write(
          `\r   ${entityType}: ${msg.inserted}/${msg.total} (${(
            (msg.inserted / msg.total) *
            100
          ).toFixed(1)}%)`
        );
      } else if (msg.type === "complete") {
        console.log(`\r   ${entityType}: ${msg.inserted}/${msg.inserted} ✅`);
        resolve();
      } else if (msg.type === "error") {
        reject(new Error(msg.error));
      }
    });

    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

async function seedData() {
  console.log("\n🌱 Starting database seeding...\n");

  try {
    // Step 1: Create Institutes
    console.log("📍 Seeding Institutes (1,000)...");
    const instituteCount = 1000;
    const institutesPerWorker = Math.ceil(instituteCount / CPU_COUNT);

    const institutePromises = [];
    for (let i = 0; i < CPU_COUNT; i++) {
      const start = i * institutesPerWorker;
      const count = Math.min(institutesPerWorker, instituteCount - start);
      if (count > 0) {
        institutePromises.push(createWorker("institutes", start, count));
      }
    }
    await Promise.all(institutePromises);

    // Fetch institute IDs
    const institutes = await Institute.findAll({ attributes: ["id"] });
    const instituteIds = institutes.map((i) => i.id);
    console.log(`✅ Created ${instituteIds.length} institutes\n`);

    // Step 2: Create Users for Students (100,000)
    console.log("👤 Creating Users (100,000)...");
    const userCount = 100000;
    const hashedPassword = await bcrypt.hash("password123", 10);

    const userBatchSize = 5000;
    const userIds: string[] = [];

    for (let i = 0; i < userCount; i += userBatchSize) {
      const batchSize = Math.min(userBatchSize, userCount - i);
      const users = await User.bulkCreate(
        Array.from({ length: batchSize }, (_, idx) => ({
          email: `student${i + idx}@example.com`,
          password: hashedPassword,
          role: "student" as "student",
        }))
      );
      userIds.push(...users.map((u) => u.id));
      process.stdout.write(
        `\r   users: ${userIds.length}/${userCount} (${(
          (userIds.length / userCount) *
          100
        ).toFixed(1)}%)`
      );
    }
    console.log(`\r   users: ${userIds.length}/${userCount} ✅\n`);

    // Step 3: Create Students (100,000)
    console.log("👨‍🎓 Seeding Students (100,000)...");
    const studentCount = 100000;
    const studentBatchSize = 5000;
    const studentIds: string[] = [];

    for (let i = 0; i < studentCount; i += studentBatchSize) {
      const batchSize = Math.min(studentBatchSize, studentCount - i);
      const students = await Student.bulkCreate(
        Array.from({ length: batchSize }, (_, idx) => {
          const globalIdx = i + idx;
          return {
            name: `Student ${globalIdx}`,
            email: `student${globalIdx}@example.com`,
            instituteId:
              instituteIds[Math.floor(Math.random() * instituteIds.length)],
            userId: userIds[globalIdx],
          };
        })
      );
      studentIds.push(...students.map((s) => s.id));
      process.stdout.write(
        `\r   students: ${studentIds.length}/${studentCount} (${(
          (studentIds.length / studentCount) *
          100
        ).toFixed(1)}%)`
      );
    }
    console.log(`\r   students: ${studentIds.length}/${studentCount} ✅\n`);

    // Step 4: Create Courses
    console.log("📚 Seeding Courses (500)...");
    const courseCount = 500;
    const coursesPerWorker = Math.ceil(courseCount / CPU_COUNT);

    const coursePromises = [];
    for (let i = 0; i < CPU_COUNT; i++) {
      const start = i * coursesPerWorker;
      const count = Math.min(coursesPerWorker, courseCount - start);
      if (count > 0) {
        coursePromises.push(createWorker("courses", start, count));
      }
    }
    await Promise.all(coursePromises);

    // Fetch course IDs
    const courses = await Course.findAll({ attributes: ["id"] });
    const courseIds = courses.map((c) => c.id);
    console.log(`✅ Created ${courseIds.length} courses\n`);

    // Step 5: Create Results (150,000)
    console.log("📊 Seeding Results (150,000)...");
    const resultCount = 150000;
    const resultsPerWorker = Math.ceil(resultCount / CPU_COUNT);

    const resultPromises = [];
    for (let i = 0; i < CPU_COUNT; i++) {
      const start = i * resultsPerWorker;
      const count = Math.min(resultsPerWorker, resultCount - start);
      if (count > 0) {
        resultPromises.push(
          createWorker("results", start, count, { studentIds, courseIds })
        );
      }
    }
    await Promise.all(resultPromises);
    console.log("");

    // Summary
    const totalInstitutes = await Institute.count();
    const totalUsers = await User.count();
    const totalStudents = await Student.count();
    const totalCourses = await Course.count();
    const totalResults = await Result.count();

    console.log("\n✅ Seeding Complete!\n");
    console.log("📊 Summary:");
    console.log(`   Institutes: ${totalInstitutes.toLocaleString()}`);
    console.log(`   Users: ${totalUsers.toLocaleString()}`);
    console.log(`   Students: ${totalStudents.toLocaleString()}`);
    console.log(`   Courses: ${totalCourses.toLocaleString()}`);
    console.log(`   Results: ${totalResults.toLocaleString()}`);
    console.log(
      `   Total Records: ${(
        totalInstitutes +
        totalUsers +
        totalStudents +
        totalCourses +
        totalResults
      ).toLocaleString()}\n`
    );
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run seeder
seedData()
  .then(() => {
    console.log("👋 Seeding process completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding process failed:", error);
    process.exit(1);
  });
