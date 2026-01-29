import express, { Application, Request, Response } from "express";
import cors from "cors";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { authMiddleware } from "./middlewares/auth";
import { UserRole } from "../generated/prisma/enums";
import { notFound } from "./middlewares/notFound";
import { medicineRouter } from "./modules/medicine/medicine.router";
import { categoryRouter } from "./modules/category/category.router";
const app: Application = express();
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

//test route protected by auth middleware
// app.get("/admin", authMiddleware(UserRole.ADMIN), (req, res) => {
//   res.send("Admin access");
// });

app.use("/medicines", medicineRouter)
app.use("/categories", categoryRouter)

app.get("/", (req: Request, res: Response) => {
  res.status(200).send({
    success: true,
    message: "Server is running",
    path: req.path,
  });
});

app.use(notFound)
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err);
  res.status(err?.statusCode || 500).json({
    success: false,
    message: err?.message || "Internal server error",
    data: null,
  });
});
export default app;
