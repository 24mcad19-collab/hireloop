import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(statsRouter);

export default router;
