import { Router } from 'express';
import { AuthController } from './controllers/AuthController.ts';
import { QuestionsController } from './controllers/QuestionsController.ts';
import { UserController } from './controllers/UserController.ts';
import { createAuthMiddleware } from './middleware/authMiddleware.ts';
import { AuthService } from './services/AuthService.ts';
import { BunPasswordHasher } from './services/BunPasswordHasher.ts';
import { createEmailService } from './services/createEmailService.ts';
import { JwtTokenService } from './services/JwtTokenService.ts';
import { QuestionsService } from './services/QuestionsService.ts';
import { UserService } from './services/UserService.ts';

const router = Router();
const jwtSecret = process.env.JWT_SECRET ?? 'development-secret';
const tokenService = new JwtTokenService(jwtSecret);
const requireAuth = createAuthMiddleware(tokenService);

const authController = new AuthController(
    new AuthService(new BunPasswordHasher(), tokenService, createEmailService()),
);
const questionsController = new QuestionsController(new QuestionsService(), tokenService);
const userController = new UserController(new UserService());

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', requireAuth, authController.logout);
router.post('/auth/password-resets', authController.requestPasswordReset);
router.get('/auth/password-resets/:token/redirect', authController.openPasswordResetLink);
router.post('/auth/password-resets/:token', authController.resetPassword);

router.get('/profile', requireAuth, userController.getProfile);
router.get('/profile/questions', requireAuth, userController.getMyQuestions);

router.get('/questions', questionsController.getQuestions);
router.post('/questions', requireAuth, questionsController.createQuestion);
router.get('/questions/:id', questionsController.getQuestion);
router.post('/questions/:id/votes', requireAuth, questionsController.setQuestionVote);
router.post('/questions/:id/answers', requireAuth, questionsController.addAnswer);
router.post('/comments/:id/votes', requireAuth, questionsController.setCommentVote);

export default router;
