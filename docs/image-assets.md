# Jazz invitation images

Generated with the built-in `image_gen` tool for the user's requested premium jazz-bar redesign. Original final MATIGNON branding was not regenerated or edited. These images are fictional atmosphere concepts, not photographs of the actual venue; the invitation includes that disclosure.

## Lounge stage

- Project file: `public/assets/jazz-lounge.png`
- Actual dimensions: 1024 × 1536 px.
- Use: full-bleed cover and hero. `object-fit: cover` adapts the portrait to the 320–480px mobile canvas. Foreground copy stays over the darker curtain/gradient zones.
- Source: `C:/Users/kihun/.codex/generated_images/01a0c154-35f5-74d0-97ac-bf2d32ae3439/exec-efa7e767-bace-4814-9b6a-0dab209241c3.png`

Final prompt:

> Use case: photorealistic-natural. Generate one premium editorial interior photograph, portrait 1024x1536, for a full-bleed mobile invitation to a sophisticated intimate Seoul jazz lounge, MATIGNON. No text or logos in image. Architectural Digest meets cinematic analogue hospitality campaign, realistic not a CGI render. View from a secluded table toward a tiny unoccupied jazz stage framed by sumptuous deep oxblood burgundy velvet curtains. A beautifully realistic glossy black grand piano on the stage, one antique brass vintage microphone on a slender stand at stage right, dark walnut wall panels. Foreground lower left: a slightly out-of-focus small round dark marble table with a tiny glowing amber shaded lamp, edge of a rich burgundy leather banquette. Warm low tungsten practical lighting, narrow honey amber pool of light on piano, rich wine-brown shadows with legible velvet texture, delicate analogue grain, nuanced contrast, hints of reflected brass. Composition: stage in middle-lower half, upper third mainly tall shadowy burgundy curtains giving calm negative space for separately rendered cream typography. No people. No instruments incorrectly merged. No neon, no gold glitter, no artificial mist, no sparkling particles, no text, no watermark. Restrained expensive intimate atmosphere, seductive warm low light but not crushed black. Image extends edge to edge. Save as a usable local image asset.

## Table detail

- Project file: `public/assets/jazz-detail.png`
- Actual dimensions: 1122 × 1402 px (generated near the requested 4:5 ratio).
- Use: 490–580px atmospheric detail section. Lazy loaded; native aspect ratio declared in markup. CSS crops for composition; the underlying generated image is unchanged.
- Source: `C:/Users/kihun/.codex/generated_images/01a0c154-35f5-74d0-97ac-bf2d32ae3439/exec-ad7ab15f-2f61-47e1-87e2-4b31db6662d6.png`

Final prompt:

> Use case: photorealistic-natural. One portrait editorial hospitality photograph 1024x1280 for a sophisticated private jazz-bar invitation. A quiet close-up at a real luxury jazz lounge: one elegant vintage crystal coupe with amber cocktail on a small polished dark walnut table; a warm tiny pleated ivory silk table lamp at upper left softly illuminates the glass; deep burgundy velvet banquette behind, with beautifully tactile wine red fabric. A subtly out-of-focus black grand piano and burgundy stage curtain in the very far background, barely indicated. Camera at seated eye-level and fairly close, cropped intimate cinematic composition. Glass and drink in middle right, lamp upper left, rich dark wood foreground lower third with calm negative space. Warm tungsten glow, deep chestnut brown shadows, cream highlights, restrained brass detail, shot on medium format with 80mm lens, delicate film grain, natural imperfect reflections, very tasteful high-end magazine photograph. Avoid CGI, illustration, neon, glitter, excessive props, people, ice shaped like gems. No text, no logo, no watermark. The feeling of an unhurried private evening listening to jazz. Full bleed photo, save usable local image asset.

## Stage curtain

- Project file: `public/assets/curtain-velvet.webp`
- Actual dimensions: 1000 × 1499 px, 119 KB.
- Use: the reveal curtain that closes over the cover and parts on the logo. Both panels draw this one photograph at `196.1%` width, each anchored to its own side, so they line up as a single drape while shut.
- Source: photograph by Ambitious Studio\* | Rick Barrett on Unsplash, `https://unsplash.com/photos/a-red-curtain-with-a-black-background-AwsdyjRm-kw`, downloaded through the Unsplash CDN at `w=1000&q=62&fm=webp`. Unsplash License: free for commercial use, attribution not required.

## Runtime behavior

Both generated assets are served locally from the project. The cover requests the stage image at high priority; opening the invitation reuses that image. The detail image is lazy loaded. Images do not require an external image host. CSS applies subtle photograph drift and readable text overlays; system reduced motion and the page's motion toggle disable motion.
