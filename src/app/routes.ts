import { Router } from "express";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./users/user.routes";
import guideRoutes from "./guides/guide.routes";
import experienceRoutes from "./experiences/experience.routes";
import reservationRoutes from "./reservations/reservation.routes";
import reviewRoutes from "./reviews/review.routes";
import notificationRoutes from "./notifications/notification.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/guides", guideRoutes);
router.use("/experiences", experienceRoutes);
router.use("/reservations", reservationRoutes);
router.use("/reviews", reviewRoutes);
router.use("/notifications", notificationRoutes);
router.get("/", (req, res) => {
  res.render("mainPage"); // solo renderiza el template, sin pasar experiencias
});

export default router;