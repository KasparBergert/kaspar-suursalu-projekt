import { Router } from 'express';
import { AuthController } from './controllers/AuthController.ts';
import { QuestionsController } from './controllers/QuestionsController.ts';
import { UserController } from './controllers/UserController.ts';
import { createAuthMiddleware } from './middleware/authMiddleware.ts';
import { AuthService } from './services/AuthService.ts';
import { BunPasswordHasher } from './services/BunPasswordHasher.ts';
import { JwtTokenService } from './services/JwtTokenService.ts';
import { QuestionsService } from './services/QuestionsService.ts';
import { UserService } from './services/UserService.ts';

const router = Router();
const jwtSecret = process.env.JWT_SECRET ?? 'development-secret';
const tokenService = new JwtTokenService(jwtSecret);
const requireAuth = createAuthMiddleware(tokenService);

const authController = new AuthController(
    new AuthService(new BunPasswordHasher(), tokenService),
);
const questionsController = new QuestionsController(new QuestionsService());
const userController = new UserController(new UserService());

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', requireAuth, authController.logout);

router.get('/profile', requireAuth, userController.getProfile);
router.get('/profile/questions', requireAuth, userController.getMyQuestions);

router.get('/questions', questionsController.getQuestions);
router.post('/questions', requireAuth, questionsController.createQuestion);
router.get('/questions/:id', questionsController.getQuestion);
router.post('/questions/:id/upvotes', requireAuth, questionsController.upVoteQuestion);
router.post('/questions/:id/answers', requireAuth, questionsController.addAnswer);

export default router;
