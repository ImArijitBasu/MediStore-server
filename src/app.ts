import express, { Application, Request, Response } from "express";
import cors from "cors";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { authMiddleware } from "./middlewares/auth";
import { UserRole } from "../generated/prisma/enums";
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

app.get("/", (req: Request, res: Response) => {
  res.status(200).send({
    success: true,
    message: "Server is running",
    path: req.path,
  });
});

export default app;
