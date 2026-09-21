# MATIGNON invitation

Confirmed: mobile-only invitation for a brand event / private party, entered by URL or QR, expressive animation, RSVP. Existing final gold brand assets must be preserved.

Design (revised at user request): premium jazz bar with burgundy velvet, dark walnut, amber lighting and restrained gold. Generated stage/table photographs fill the mobile canvas, separated by an ivory invitation. Small original monogram, editorial serif typography, slow photograph drift and light breathing replace synthetic arches and particles. Images are labeled concepts. A single mobile canvas (max 480px) also previews on desktop. Effects respect reduced motion. No audio autoplays.

Flow: open invitation → event overview → details → RSVP sheet → receipt. Share sheet offers Web Share, clipboard, and a locally generated QR. No external QR service receives the URL.

Cover revision: user-provided gold brush-calligraphy on ivory paper reference. A new `calligraphy-cover.png` replaces only the initial photographic cover; central invitation copy and opening action remain live HTML. `cover.css` exclusively owns this first screen, including reduced-motion-compatible page fade/lift. Existing jazz content and RSVP behavior remain the destination after opening.

Premium RSVP continuation: all inner content and overlays now share ivory stationery, antique-gold Pinyon Script titles, dark serif/body copy, fine photo frames, and burgundy primary/selected controls. Hero photos are inset into the invitation rather than full-screen backgrounds. RSVP and receipts use double-line paper borders; share and response sheets use the same light palette. Form/API behavior is unchanged. `DESIGN.md` records the current runtime tokens and supersedes earlier dark-content visual notes.

Implementation: React + TypeScript + Vite; same-origin Node server, SQLite for configured live responses. Default preview mode collects no durable personal data and clearly labels simulated receipts. Date/address remain unconfirmed. Production mode requires configured event dates, address, canonical HTTPS URL, and organizer-approved privacy notice. SQLite requires persistent storage; no public RSVP list API. Export is a local operator command only. Form posts use validation, same-origin checks, bounded body size, rate limiting, timeouts, and idempotency keys.

Verification: typecheck/build; API contract tests including invalid data, idempotency and preview no-storage; real Chromium mobile flow at 320/390/480px, keyboard, modal focus, reduced motion, failed request recovery, QR decode and accessibility audit. Physical mobile and public deployment require separate verification.
