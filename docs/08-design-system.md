# Design system: Lumen Studio

The frontend is branded as **Lumen Studio**, a fictional digital studio that builds headless websites. The seed content, artwork and Globals all match. The content model didn't change: the same five Block Types, the same fields. Only the Block Components and the site chrome were restyled, which is the Adapter boundary paying off ([ADR 0002](adr/0002-cms-agnostic-adapter.md)).

## Foundations

| | Choice | Where |
|---|---|---|
| Headings | **Unbounded**: wide, rounded, geometric. Fun but legible | `app/layout.tsx` (`next/font`) → `--font-heading` |
| Body | **Inter** | `--font-sans` |
| Colour | Violet primary, with fuchsia and cyan accents for gradients and glows | `app/globals.css`: `:root` (light) and `.dark` |
| Themes | Light + dark, following the OS by default, with a toggle | `next-themes` in `components/site/providers.tsx` |
| Rich text | Tailwind Typography (`prose`), tuned to the tokens | `components/site/prose.tsx` |

- **Tokens, not hard-coded colours.** shadcn components already read CSS variables (`--primary`, `--muted`…). The Aceternity components were edited to use them too, so one palette change restyles everything in both themes. Extra brand tokens: `--brand-violet`, `--brand-fuchsia`, `--brand-cyan` and `--glow`, available as Tailwind colours (`from-brand-violet`, `bg-glow`).
- **`next/font`** downloads the Google fonts at build time and self-hosts them, so there's no request to Google and no layout shift.
- **No flash of the wrong theme.** next-themes injects a tiny inline script that sets `.dark` on `<html>` before first paint. `suppressHydrationWarning` on `<html>` is required for that. The toggle picks its icon with CSS (`dark:hidden`), not state, so server and client HTML match.
- **Utilities** in `globals.css`:
  - `container-page`: the page width and gutters every Block uses
  - `text-gradient`
  - `bg-grid`: a CSS-only fading grid

## Where each component comes from

| Area | Built from | Runs in the browser? |
|---|---|---|
| Header | Aceternity **Resizable Navbar**: full width at the top, shrinks into a floating blurred pill on scroll. Sliding hover pill on links. Mobile menu | yes (scroll + menu state) |
| Theme toggle | lucide icons + next-themes | yes |
| Hero | CSS grid + glow, plus Aceternity **Spotlight New** (drifting light beams, recoloured violet). shadcn `Button` styles on the CTA | Spotlight only |
| Rich Text | Tailwind Typography. **No effects**, because this is reading content | only the fade-in |
| Feature Grid | **Bento** layout (one tall card beside two wide ones, per group of three) + Aceternity **Glowing Effect** (a border glow that follows the cursor) | Glowing Effect only |
| Media + Text | Aceternity **3D Card Effect**: the image tilts towards the cursor | the card only |
| CTA Banner | Aceternity **Background Beams With Collision** + **Hover Border Gradient** button | yes, both |
| Footer | shadcn `Separator` + Aceternity **Text Hover Effect** wordmark (the site name outlined; a gradient follows the cursor) | the wordmark only |
| 404, Draft Preview banner | shadcn `Button`, tokens | no (the banner's exit is a Server Action) |

Other Aceternity components were looked at and left out:
- Background Beams and Grid Backgrounds: replaced by CSS.
- Card Spotlight: dark-only.
- Text Generate Effect: it animates the LCP heading in, which is bad for performance.
- Bento Grid: the layout is hand-rolled because the number of features varies.

## Server Components with client islands

Every Block Component is still a **Server Component**. Effects are small `"use client"` components *inside* them. Server-rendered children (like `next/image`) can be passed through a client component, so the content still arrives as HTML.

```
<FeatureGrid>                 server: fetches nothing, renders HTML
  <li>
    <GlowingEffect/>          client island: listens to the pointer
    <Reveal>                  client island: fades in on scroll
      <Image/> <h3/> <p/>     server-rendered, passed through as children
```

`yarn build` still shows `/` and `/about` as **SSG** (prerendered). The islands add JavaScript (the `motion` library plus the effects), but not data fetching or loading states. `components/site/reveal.tsx` is the shared scroll-reveal island.

## Aceternity is copy-paste: we own the code

Aceternity (like shadcn) isn't an npm dependency. The shadcn CLI copies the source into `components/ui/`:

```bash
yarn shadcn add https://ui.aceternity.com/registry/<component>.json   # yarn 1 has no dlx
```

Owning it means fixing it. What was changed, and why (each file has a header comment):

- **Theming:** hard-coded `neutral-*`, `#3275F8` and rainbow gradients were replaced with tokens or brand colours, so everything works in light and dark mode.
- **Accessibility:**
  - Resizable Navbar: the mobile toggle was a clickable icon. It's now a `<button>` with `aria-expanded`, `aria-controls` and a label.
  - Decorative effects are `aria-hidden`.
- **Layout:**
  - Resizable Navbar: `width: 40%; min-width: 800px` overflowed mid-size screens. It now animates `max-width`, and one bar serves every screen size (the original rendered separate desktop and mobile bars, duplicating the links).
  - Text Hover Effect: sized its `viewBox` for about four letters. It now grows with the text, and it draws in on scroll instead of on mount.
- **Lint (React 19 / Next 16 rules):**
  - `Math.random()` during render moved into a lazy `useState`.
  - `any` props replaced with real types.
  - Effects got complete dependency lists.
  - Nullable refs were typed properly.
  - Unused `forwardRef` removed.
- **Dependencies:** `@tabler/icons-react` was swapped for lucide, which is already installed.

## Page transitions (View Transitions API)

Navigating between Pages crossfades: the old page leaves quickly, drifting up with a slight blur, and the new one rises in a beat later. The header stays perfectly still.

**How:** React's `<ViewTransition>` drives the browser's native [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API). No animation library and no configuration are needed: Next.js navigations are React Transitions, and those are what activate it.

```tsx
// app/[[...slug]]/page.tsx
<ViewTransition key={page.path} enter="page-enter" exit="page-exit" default="none">
  <div><BlockRenderer … /></div>
</ViewTransition>
```

The animation itself is plain CSS in `globals.css`: `::view-transition-old(.page-exit)` and `::view-transition-new(.page-enter)`.

**Choices (from the Next.js view-transitions guide's four patterns):**
- **Same-route crossfade, keyed by path.** Every Page renders through the one `[[...slug]]` route, so without the `key`, React would see an update, not an exit + enter.
- **Not directional slides.** Home and About are sibling Pages the editor defines. Left/right motion would claim a forward/back hierarchy that doesn't exist.
- **Not shared-element morphs.** Nothing is actually the same element across Pages. A morph would be a good fit for e.g. a Feature card → a detail page, if that existed.
- **Asymmetric timing:** exit 160ms, enter 260ms fade after a 120ms delay, with a 420ms rise. Old content gets out of the way, and new content arrives gently.
- **Header anchored:** the pill is named `site-header` (via `[data-site-header]` in `globals.css`), drawn above the changing page, and not animated, so it's the fixed reference point. Its `backdrop-filter` is off while `:root:active-view-transition` matches, and the scrolled pill gets a more solid background for those few hundred milliseconds.
- **Clicks aren't blocked** during the animation (`::view-transition { pointer-events: none }`).
- **Reduced motion keeps a short opacity crossfade** and drops the movement and blur.
- **Browsers without support** (or older ones) just swap instantly.

**Verified in Chromium** (Playwright recording `document.getAnimations()` on the pseudo-elements, in dev and production):
- nav links and in-content CTA links run the exit and enter animations
- reduced motion runs opacity only
- the header doesn't move, and there's no flash in the header in real Chrome (GPU) at the top of the page, scrolled, or in light and dark mode

**Browser Back/Forward swap instantly.** Next.js does wrap popstate in `startTransition`, but React renders transitions started during a `popstate` event eagerly (`shouldAttemptEagerTransition` in react-dom), so scroll restoration works, and no view transition runs. That's also the right result on mobile, where swipe-back gestures draw their own animation.

**Gotchas hit:**
Three attempts at anchoring the frosted header, each with a different failure:
1. **Named the wrapper.** A `view-transition-name` makes its element a **backdrop root**, so the pill's `backdrop-filter` (a child) could no longer see the page. The blur disappeared.
2. **Named the pill itself.** A named element is captured as a flat image, and in Chrome that image **includes what its `backdrop-filter` was showing**. At the top of Home that was the Hero's purple glow, so a hard-edged purple rectangle was painted over the next page. Headless Chromium didn't show it. Real Chrome (GPU) did, found by recording every frame with the DevTools screencast.
3. **Named only the contents.** Then the pill's background stayed in the root snapshot, *under* the page snapshots, so page content briefly painted over the pill.

**Final version:** name the pill, and switch its `backdrop-filter` off with `:root:active-view-transition` so the snapshots are clean. Mix the temporary background in **sRGB**: `color-mix(in oklch, …, transparent)` tinted it maroon, because `transparent` has no hue and OKLCH interpolated one.
- Watching the header during transitions exposed an existing bug: the Resizable Navbar animated `max-width` on **every page load** (no `initial` value). Fixed with `initial={false}`.

## Motion and accessibility

- `<MotionConfig reducedMotion="user">` turns off transform animations (slides, drifting beams, the spotlight) for people with *prefers-reduced-motion*. Fades still play.
- The 3D Card sets transforms directly, not through motion, so it checks `prefers-reduced-motion` itself.
- The Hero heading and image aren't animated in. They're the Largest Contentful Paint element, so they paint immediately.
- Scroll reveals play once (`viewport.once`).

## Editors and design

Editors still control **which Blocks, in what order, with what content**. They don't control appearance. That was a deliberate choice: the Blocks are the Blocks. A common agency extension is per-Block **variants** (a "Background: Beams / Spotlight / None" select, or "Layout: Bento / Cards"). That would mean one SCF select field, one Adapter line and a prop on the component. It isn't built here.

## Brand assets and design review

- `web/scripts/generate-seed-art.mjs` (`yarn seed-art`) renders the abstract artwork and the logo mark with Playwright into `wordpress/assets/`. `seed.php` imports them into the Media Library, so content images come from WordPress like real uploads.
- The site name in the header, footer and `<title>` is WordPress's **Settings → General → Site Title** (`generalSettings.title` in WPGraphQL), not a hard-coded string.
- `yarn screenshot` (dev server running) takes full-page screenshots of `/` and `/about` at desktop and mobile widths, in light and dark mode, into `web/screenshots/` (gitignored). It scrolls first, so scroll reveals have played. This was the design review loop.
