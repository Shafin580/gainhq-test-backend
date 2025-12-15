import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface ResultAttributes {
  id: string;
  studentId: string;
  courseId: string;
  score: number;
  grade: string;
  year: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ResultCreationAttributes
  extends Optional<ResultAttributes, "id" | "createdAt" | "updatedAt"> {}

class Result
  extends Model<ResultAttributes, ResultCreationAttributes>
  implements ResultAttributes
{
  public id!: string;
  public studentId!: string;
  public courseId!: string;
  public score!: number;
  public grade!: string;
  public year!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Result.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "students",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    grade: {
      type: DataTypes.STRING(2),
      allowNull: false,
      validate: {
        isIn: [
          ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"],
        ],
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2000,
        max: 2100,
      },
    },
  },
  {
    sequelize,
    tableName: "results",
    timestamps: true,
  }
);

export default Result;
