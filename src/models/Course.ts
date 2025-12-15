import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface CourseAttributes {
  id: string;
  title: string;
  code: string;
  credits: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CourseCreationAttributes
  extends Optional<CourseAttributes, "id" | "createdAt" | "updatedAt"> {}

class Course
  extends Model<CourseAttributes, CourseCreationAttributes>
  implements CourseAttributes
{
  public id!: string;
  public title!: string;
  public code!: string;
  public credits!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      validate: {
        min: 1,
        max: 6,
      },
    },
  },
  {
    sequelize,
    tableName: "courses",
    timestamps: true,
  }
);

export default Course;
