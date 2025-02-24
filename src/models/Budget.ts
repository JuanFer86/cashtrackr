import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  AllowNull,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import Expense from "./expenses";
import User from "./User";

// decorator table
@Table({
  tableName: "budgets",
})
class Budget extends Model<Budget> {
  @AllowNull(false)
  @Column({
    type: DataType.STRING(100),
  })
  declare name: string;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL,
  })
  declare amount: number;

  @HasMany(() => Expense, {
    onUpdate: "CASCADE", // CASCADE, RESTRICT, NOT ACTION, SET NULL
    onDelete: "CASCADE",
  })
  declare expenses: Expense[];

  @ForeignKey(() => User)
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;
}

export default Budget;
