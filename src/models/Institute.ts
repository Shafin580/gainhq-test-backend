import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface InstituteAttributes {
  id: string;
  name: string;
  location: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InstituteCreationAttributes
  extends Optional<InstituteAttributes, "id" | "createdAt" | "updatedAt"> {}

class Institute
  extends Model<InstituteAttributes, InstituteCreationAttributes>
  implements InstituteAttributes
{
  public id!: string;
  public name!: string;
  public location!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Institute.init(
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
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "institutes",
    timestamps: true,
  }
);

export default Institute;
