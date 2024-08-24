import express from "express";
import cors from "cors";
import userRouter from "./routers/user";
import adminRouter from "./routers/admin";

const app = express();

app.use("/v1/user", userRouter);
app.use("/v1/admin", adminRouter);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.listen(3000, () => console.log("Server started on port 3000"));
