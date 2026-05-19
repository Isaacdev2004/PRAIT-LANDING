import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import matcherRouter from "./matcher";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactRouter);
router.use(matcherRouter);

export default router;
