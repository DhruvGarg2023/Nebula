import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '../../../config/index.js';
import logger from '../../../core/logger/index.js';

/**
 * Passport.js Google OAuth 2.0 strategy configuration.
 *
 * Design decisions:
 * - Stateless mode: no Passport sessions (JWT-based auth)
 * - Only requests 'profile' and 'email' scopes (minimum required)
 * - Extracts googleId, email, name, avatarUrl from the profile
 * - No database access in the strategy — that happens in the service layer
 *
 * The verify callback receives the Google profile and passes a normalized
 * user object to the controller via `done(null, user)`.
 *
 * @param {import('passport')} passport
 */
export function configureGoogleStrategy(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          // Extract the fields we need from Google's profile
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || profile.name?.givenName || 'User';
          const avatarUrl = profile.photos?.[0]?.value || null;
          const googleId = profile.id;

          if (!email) {
            logger.error({ googleId }, 'Google OAuth: no email in profile');
            return done(new Error('No email provided by Google'), null);
          }

          // Pass normalized profile to controller — no DB access here
          const normalizedProfile = {
            email,
            name,
            avatarUrl,
            googleId,
          };

          return done(null, normalizedProfile);
        } catch (err) {
          logger.error({ err }, 'Google OAuth strategy error');
          return done(err, null);
        }
      }
    )
  );
}
