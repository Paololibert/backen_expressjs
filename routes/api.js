import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import authMiddleware from "../middleware/Authenticate.js";
import ProfileController from "../controllers/ProfileController.js";
import NewsController from "../controllers/NewsController.js";

const router = Router();

// Registering and login
router.post("/auth/register", AuthController.register)
router.post("/auth/login", AuthController.login)


//Profile routes

router.get("/profile", authMiddleware, ProfileController.index); // Get the user's profile
router.put("/profile/:id",authMiddleware, ProfileController.update);  // Update profile


//News
router.get("/news", NewsController.index);   //Get all news 

router.post("/news", authMiddleware , NewsController.store);  //Create a new news item 

router.get("/news/:id" , NewsController.show);

router.put("/news/:id", authMiddleware , NewsController.update);

router.delete("/news/:id", authMiddleware , NewsController.destroy);


export default router