import { Router } from "express";
import userRoutes from "./users/user.routes";
import guideRoutes from "./guides/guide.routes";
import experienceRoutes from "./experiences/experience.routes";
// import reservationRoutes from "./reservations/reservation.routes";
// import reviewRoutes from "./reviews/review.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/guides", guideRoutes);
router.use("/experiences", experienceRoutes);
// router.use("/reservations", reservationRoutes);
// router.use("/reviews", reviewRoutes);

export default router;