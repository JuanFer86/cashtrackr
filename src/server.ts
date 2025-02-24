import express from "express";
import colors from "colors";
import morgan from "morgan";
import { db } from "./config/db";
import budgetRouter from "./routes/budgetRouter";
import authRouter from "./routes/AuthRouter";
import { limiter } from "./config/limiter";

async function connectDb() {
  try {
    await db.authenticate();
    db.sync();
    console.log(colors.blue.bold("Succesfully connection to DB"));
  } catch (error) {
    console.log(error);
    console.log(colors.red.bold("failed connection to DB"));
  }
}

connectDb();

const app = express();

app.use(morgan("dev"));

app.use(express.json());

// limit all request
app.use(limiter);

app.use("/api/budgets", budgetRouter);
app.use("/api/auth", authRouter);

export default app;
