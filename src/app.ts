import { orderRouter } from './modules/order/order.router';
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { notFound } from "./middlewares/notFound";
import { medicineRouter } from "./modules/medicine/medicine.router";
import { categoryRouter } from "./modules/category/category.router";
import { adminRouter } from "./modules/admin/admin.router";
import { cartRouter } from './modules/cart/cart.router';
import { reviewRouter } from './modules/review/review.router';
const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));

//test route protected by auth middleware
// app.get("/admin", authMiddleware(UserRole.ADMIN), (req, res) => {
//   res.send("Admin access");
// });

app.use("/api/medicines", medicineRouter)
app.use("/api/categories", categoryRouter)
app.use("/api/admin", adminRouter)
app.use("/api/orders", orderRouter)
app.use("/api/cart", cartRouter)
app.use("/api/reviews", reviewRouter)

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
