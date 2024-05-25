import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";


import testRouter from "./routes/test.routes.js";
import authRouter from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import usersRoutes from "./routes/user.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import medicineRoutes from "./routes/medicine.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import categoryDetailRoutes from "./routes/categoryDetail.routes.js";
import categoryBlogRoutes from "./routes/categoryBlog.routes.js";


const app = express();

export const otpStore = {};

app.set("port",process.env.PORT|| 8080);
app.set("json space",4);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

// Routes
app.use("/test",testRouter);
app.use('/api/auth', authRouter);
app.use('/api/category',categoryRoutes);
app.use('/api/users',usersRoutes);
app.use('/api/dashboard',dashboardRoutes);
app.use('/api/medicine',medicineRoutes);
app.use('/api/blog',blogRoutes);
app.use('/api/brand',brandRoutes); 
// Chưa test
app.use('/api/categoryDetail',categoryDetailRoutes);
app.use('/api/categoryBlog',categoryBlogRoutes);


export default app;
