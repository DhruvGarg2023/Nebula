"use client";

import OAuthCallbackPage from "@/app/callback/page";

/**
 * Mirror route for OAuth Callback (/auth/callback -> /callback).
 * Ensures both /callback and /auth/callback redirect URLs work identically.
 */
export default OAuthCallbackPage;
