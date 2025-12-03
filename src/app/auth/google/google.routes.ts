import { Router } from 'express';
import passport from 'passport';
import * as googleController from './google.controller';

const router = Router();

// GET /api/auth/google
router.get('/', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
}));

// GET /api/auth/google/callback
router.get('/callback', 
    passport.authenticate('google', { 
        session: false,
        failureRedirect: '/login' 
    }), 
    googleController.googleCallback
);

export default router;