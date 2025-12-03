import { Express } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import GoogleAuthService from './google.service';

const googleService = new GoogleAuthService();

export function initGoogleStrategy(app: Express) {
    passport.use(
        new GoogleStrategy({
            clientID: process.env.GOOGLE_ID ?? '',
            clientSecret: process.env.GOOGLE_SECRET ?? '',
            // IMPORTANTE: Esta URL debe ser idéntica a la que pusiste en Google Cloud Console
            callbackURL: process.env.GOOGLE_CALLBACK_URL, 
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                const result = await googleService.handleGoogleAuth(profile);
                return done(null, result as any);
            } catch (error) {
                return done(error, undefined);
            }
        })
    );

    passport.serializeUser((user: any, done) => done(null, user));
    passport.deserializeUser((user: any, done) => done(null, user));
}