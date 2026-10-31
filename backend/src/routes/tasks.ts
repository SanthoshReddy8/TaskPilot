import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  handleTaskError,
  updateTask,
} from "../controllers/taskController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);
router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);
router.use(handleTaskError);

export default router;
