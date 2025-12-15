import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  role: "admin" | "student";
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public email!: string;
  public password!: string;
  public role!: "admin" | "student";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "student"),
      allowNull: false,
      defaultValue: "student",
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  }
);

export default User;
