# Cloud continuation — October 2026

Continues from `develop` commit 56249da. GymRatAI stays on its own Supabase project (`pfdccebdizfchsnyuvnt`), separate from FieldMed / Zoctor / DocConnect.

Authentication now persists sessions with the Expo SDK 57 compatible AsyncStorage adapter, uses Supabase's process lock, and starts/stops token refresh with foreground lifecycle. Navigation restores the session and loads the account's profile before mounting protected screens; sign-out removes those screens and clears the user store. Account switching ignores stale profile requests. Missing cloud configuration shows a setup screen rather than crashing during module import. Login no longer races navigation against auth events.

Validated by Android and iOS JavaScript exports. This does not establish native device behavior or real account end-to-end authentication. Device QA is still needed for restart persistence, expired sessions, sign-out/back navigation, and profile save.

Figma reference inspected: https://www.figma.com/design/rCrtUV43PU7m5A7FiVAv8j?node-id=3137-3374 . The existing design is retained in this auth-focused change; exact visual implementation of that frame remains pending. Monday auth blocker: https://tinorokis-team.monday.com/boards/5104814266/pulses/3241383417 .
