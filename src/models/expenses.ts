import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
  AllowNull,
} from "sequelize-typescript";
import Budget from "./Budget";

// decorator table
@Table({
  tableName: "expenses",
})
class Expense extends Model {
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

  @ForeignKey(() => Budget)
  declare budgetId;

  @BelongsTo(() => Budget)
  declare budget: Budget;
}

export default Expense;
