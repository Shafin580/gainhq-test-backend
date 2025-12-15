import User from "./User";
import Institute from "./Institute";
import Student from "./Student";
import Course from "./Course";
import Result from "./Result";

// Define associations between models

// User <-> Student (One-to-One)
User.hasOne(Student, {
  foreignKey: "userId",
  as: "student",
  onDelete: "CASCADE",
});
Student.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Institute <-> Student (One-to-Many)
Institute.hasMany(Student, {
  foreignKey: "instituteId",
  as: "students",
  onDelete: "CASCADE",
});
Student.belongsTo(Institute, {
  foreignKey: "instituteId",
  as: "institute",
});

// Student <-> Result (One-to-Many)
Student.hasMany(Result, {
  foreignKey: "studentId",
  as: "results",
  onDelete: "CASCADE",
});
Result.belongsTo(Student, {
  foreignKey: "studentId",
  as: "student",
});

// Course <-> Result (One-to-Many)
Course.hasMany(Result, {
  foreignKey: "courseId",
  as: "results",
  onDelete: "CASCADE",
});
Result.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course",
});

export { User, Institute, Student, Course, Result };
