---
version: alpha
name: MATIGNON Invitation
description: A premium ivory-and-antique-gold RSVP invitation with calligraphy, framed jazz photography, and stationery response cards.
colors:
  ink: "#191210"
  panel: "#f8f4e9"
  gold: "#795f2e"
  gold-light: "#dbc294"
  text: "#3d3428"
  muted: "#726652"
  line: "#cbbda5"
  wine: "#381b20"
  paper: "#f1ecde"
  error: "#a43830"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
  sans:
    fontFamily: "Noto Sans KR, sans-serif"
  script:
    fontFamily: "Pinyon Script, cursive"
rounded:
  DEFAULT: "0px"
  sheet: "4px"
spacing:
  page-max: "480px"
  section-gap: "84px"
components:
  button: {}
  dialog: {}
  input: {}
---

# MATIGNON Design System

## Overview

### Creative North Star

The entire experience now follows the user's premium RSVP stationery direction. The first cover retains the supplied-reference gold brush-calligraphy on ivory paper. Opening it continues into ivory stationery with antique-gold script, dark ink serif text, generous centered spacing, and framed jazz-lounge photographs. The RSVP invitation, response form, share sheet and receipt belong to the same paper suite. Burgundy is reserved for selected controls and primary actions. Generated venue images remain labeled as concepts rather than actual venue photography.

### Product context and register

Korean-speaking guests at a brand event/private party. Mobile link/QR entry, one-hand reading and RSVP. Hybrid brand storytelling plus a short response form. English display copy is atmospheric; Korean owns all instructions, statuses and errors. Market location beyond the supplied Seoul brand is unconfirmed. No confirmed date, address, privacy policy or public deployment is fabricated. Signature: personal calligraphy and fine-framed photography as a coordinated invitation suite. Restraint: script only in titles/signatures; forms stay readable and semantic. Avoid glitter, full-screen dark marketing panels, synthetic arches, confetti, audio autoplay and invented live event details.

Runtime token owner is `src/styles.css` `:root`; frontmatter mirrors its semantic values. Shared form/dialog rules remain there. `src/brand.css` owns the jazz content surfaces; `src/cover.css` owns the reference-specific ivory cover, paper/dark-ink colors and mobile layout. The prior photographic cover rules were removed. Scene-specific translucent colors are decorative lighting only. No alternate theme adapter exists.

## Colors

Paper and panel are two warm ivory stationery surfaces. Ink/text supply dark print; muted is legible brown secondary copy; gold is antique bronze-gold dark enough for small labels on ivory; wine is the selected/primary action color with panel-colored text. Line defines hairline frames and fields; error is readable deep red. Gold-light supports toast accents. Forced colors uses native control colors. There is one consistent light stationery theme; venue photographs supply atmospheric dark contrast.

## Typography

Locally hosted Pinyon Script 400 owns expressive title words and signatures; Cormorant Garamond 400 owns companion serif headings and the wordmark; Noto Sans KR 400 owns Korean copy and controls. Hero script 74–83px with 42–47px serif, RSVP script 51–60px, modal script 43–53px, Korean body 10–14px, input 16px to avoid iOS zoom. Tiny uppercase English text is decorative labeling and never the only essential instruction.

The first cover's large calligraphy is raster artwork; a visually hidden H1 provides its textual equivalent. Locally hosted Caveat 500 is the central handwritten-style invitation copy. Action, venue and Korean copy remain real HTML, not baked into the image. The flat stationery artwork scales with the mobile canvas to keep its reserved central whitespace aligned with live copy; photographic content keeps `object-fit: cover`.

## Layout

Single document scroller, 320–480px mobile canvas; desktop is a centered preview. Sections use 25–32px insets and approximately 84px vertical spacing. Sticky response bar and modal include safe-area insets. Dialog has its own scroll at max 90dvh. Inputs remain in natural flow. Reserved image dimensions prevent layout shifts.

## Elevation & Depth

Photography sits inside fine double frames with subtle paper shadows. The RSVP invitation and receipt use fine inset outlines, without generic dashboard cards. The sticky bar is translucent ivory with a burgundy action. Dialog backdrops are softly dimmed; dialogs are light paper.

## Shapes

Square controls, fine borders, and a small oval monogram on the RSVP invitation. Bottom sheets have restrained 4px top corners. No fake architectural outlines are layered over photography.

## Components

### Foundational visual states

Burgundy actions lighten on hover, shift one pixel on press and show dark-gold focus outlines. Selected attendance buttons pair burgundy fill with a checkmark. Disabled controls lower opacity and stop activation. Busy labels preserve button size and show a light spinner. Errors appear inline in deep red with accessible associations.

### Buttons and actions

Burgundy solid for RSVP and sharing; outline for QR/link actions; antique-gold text links for supporting actions. The historical `gold-button` class is the shared primary action owner and now renders the burgundy stationery variant. All buttons and stepper controls have at least 44px height.

### Navigation and data display

Anchors navigate to content; fixed RSVP action opens the same sheet at every location. Unconfirmed date and address show explicit pending copy. No tables or list pagination.

### Forms and overlays

`Modal.tsx` owns native dialog showModal, inert background, keyboard trap, Escape, scroll lock and focus restoration. `App.tsx` owns the single RSVP form, validation and live-region feedback. Attendance uses two pressed-state buttons. Guest count uses labeled stepper buttons, no dropdown. No browser validation bubbles. Inputs survive failed requests. Preview does not persist personal data. Live mode requires the operator-provided privacy notice and stores only name, attendance, guest count, idempotency key and timestamp. Toast is an auxiliary status; inline errors remain authoritative.

### Iconography

Lucide, 14–20px line icons. Icons supplement labels; header icon buttons have Korean accessible names.

### Motion

One-second ivory-page fade/lift into the inner invitation, a 24-second 2.5% photographic drift confined to the image frame, subtle light breathing, intersection reveals and 350ms sheet entry. Explicit animation toggle plus system reduced-motion support disables all effects. No particles and no sound. Decorative effects never block RSVP.

### Content and data visualization

Warm understated Korean with direct action labels. Preview receipts explicitly state that no actual attendance registration occurred. Real receipts are response confirmations, not entry tickets.

## Do's and Don'ts

- Do preserve the provided final logo artwork.
- Do keep dates, venues and registration states truthful.
- Don't autoplay audio or require motion to read the page.
- Don't publish live mode without the event information, privacy notice and persistent storage.
