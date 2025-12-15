import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface StudentAttributes {
  id: string;
  name: string;
  email: string;
  instituteId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StudentCreationAttributes
  extends Optional<StudentAttributes, "id" | "createdAt" | "updatedAt"> {}

class Student
  extends Model<StudentAttributes, StudentCreationAttributes>
  implements StudentAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public instituteId!: string;
  public userId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Student.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    instituteId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "institutes",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "students",
    timestamps: true,
  }
);

export default Student;
