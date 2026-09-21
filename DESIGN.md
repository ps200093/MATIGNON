---
version: alpha
name: MATIGNON Invitation
description: A concise black-and-champagne-gold private jazz invitation with live calligraphy and fine ornamental framing.
colors:
  ink: "#10110f"
  panel: "#191a17"
  gold: "#d2af6c"
  gold-light: "#ead2a2"
  text: "#eee5d3"
  muted: "#ada593"
  line: "#4b4332"
  paper: "#10110f"
  error: "#f2a29a"
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
  section-gap: "28px"
components:
  button: {}
  dialog: {}
  input: {}
---

# MATIGNON Design System

## Overview

### Creative North Star

The user's black-and-gold invitation reference supersedes the earlier ivory stationery. The original oversized gold brush-calligraphy artwork is restored on black stock, preserving the sweeping Y and I flourishes and center-right live copy. Inside, one jazz photograph and a single Korean invitation line lead directly to date, venue and RSVP. This is a short invitation, not a long brand landing page.

### Product context and register

Korean-speaking guests at a MATIGNON brand event/private party, entering by mobile link or QR. English calligraphy establishes mood; Korean owns actions and essential information. Unknown event dates and addresses remain explicitly pending. Cover ornaments and the font-based title were removed in favor of the original expressive brush artwork. The existing accessible RSVP, receipt and sharing flows are retained. Runtime token owner is src/styles.css :root; this frontmatter mirrors its values. src/brand.css owns internal layout and src/cover.css owns the cover. Both consume the shared tokens.

## Colors

Paper and ink use #10110f black; panel is #191a17. Gold #d2af6c supplies display text and primary fill, gold-light supplies hover. Text #eee5d3 and muted #ada593 remain legible on black. Line #4b4332 is decorative separation; interactive fields and selected controls use stronger gold edges. Error #f2a29a supplies readable inline feedback. QR codes retain a light scan surface. There is one dark theme across cover, invitation, form and receipt.

## Typography

The cover uses public/assets/calligraphy-cover-black.png, a black-background edit of the original brush-calligraphy artwork. Its accessible H1 remains HTML. Locally hosted Pinyon Script owns inner-page display accents. Cormorant Garamond owns serif headings and wordmarks; Noto Sans KR owns Korean copy and controls. The cover artwork fills its reserved viewport, with live venue/copy/action in the center-right whitespace. Inner title 67–76px paired with 38–43px serif; body 12–13px; form input 16px. Decorative small labels never carry essential information alone.

## Layout

Single document scroller, 320–480px mobile canvas, centered on desktop. Cover fills a viewport with a 660–680px minimum to avoid crowding on short screens. Internal content is approximately 1100px tall at 390px width, with 22–28px insets. One image, one invitation line, two detail rows and one RSVP section. Sticky response bar and sheets include safe-area insets.

## Elevation & Depth

Near-black surfaces, fine gold frames and restrained dimmed backdrops. No light cards or long alternating editorial sections. The cover preserves textured gold brush lettering from the earlier artwork.

## Shapes

Square controls and thin gold borders. The cover uses the expressive lettering itself as ornament; no extra rosettes or monogram frame.

## Components

### Foundational visual states

Gold primary actions carry black text; hover uses pale gold. Selected attendance buttons pair gold fill with a checkmark. Disabled actions lower opacity; busy labels retain dimensions. Gold focus outlines and text error messages remain visible on dark surfaces.

### Buttons and actions

Gold solid for RSVP and sharing, outlined gold for secondary controls. The gold-button class owns all primary buttons. Buttons and steppers retain at least 44px touch height.

### Navigation and data display

Anchors navigate to content; fixed RSVP action opens the same sheet at every location. Unconfirmed date and address show explicit pending copy. No tables or list pagination.

### Forms and overlays

`Modal.tsx` owns native dialog showModal, inert background, keyboard trap, Escape, scroll lock and focus restoration. `App.tsx` owns the single RSVP form, validation and live-region feedback. Attendance uses two pressed-state buttons. Guest count uses labeled stepper buttons, no dropdown. No browser validation bubbles. Inputs survive failed requests. Preview does not persist personal data. Live mode requires the operator-provided privacy notice and stores only name, attendance, guest count, idempotency key and timestamp. Toast is an auxiliary status; inline errors remain authoritative.

### Iconography

Lucide, 14–20px line icons. Icons supplement labels; header icon buttons have Korean accessible names.

### Motion

One-second cover fade/lift, subtle framed-photo drift, intersection reveals and 350ms sheet entry. The explicit animation toggle and system reduced-motion preference disable effects. No audio or confetti.

### Content and data visualization

Only one short invitation line, date, place and response action remain in the body. Repetitive slogans, the second photo section, extended introduction and dress-code prose are removed. Preview registration disclosure remains near the action and in the form/receipt. Generated photography has a compact AI concept caption.

## Do's and Don'ts

- Do preserve the provided final logo artwork.
- Do keep dates, venues and registration states truthful.
- Don't autoplay audio or require motion to read the page.
- Don't publish live mode without the event information, privacy notice and persistent storage.
