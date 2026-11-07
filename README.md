# Diwali wish card maker

A small static website: light a diya, write a personal Diwali greeting in English or Hindi, and share it as a link. Plain HTML, CSS and JavaScript. No framework, build step, server, database, cookies or analytics.

Original concept: Storymint Studio. This is a redesign of that project; the original ZIP was left untouched.

## Features

- Welcome, diya, greeting creator and card screens, with focus moved to each screen's heading.
- Diya is a real button (`aria-pressed`) that works with touch, mouse and keyboard. "Skip lighting" is always available. The warm glow stays on the following screens.
- Greeting creator: recipient (optional), sender (optional), English or Hindi, six relationship styles (anyone, family, friends, parents and grandparents, teachers, colleagues), an editable message of up to 280 characters.
- Card shown with `textContent` only. Share link stores the card in the URL fragment.
- Share: native share menu where supported, Copy link, Copy greeting text. If the clipboard is blocked, the text is selected in a box for manual copy. Messages only report real outcomes.
- Optional fireworks (off by default, capped at 300 particles, paused when the tab is hidden, disabled when the device asks for reduced motion). No sound.
- Recipients who open a link see the card directly and can make their own.

## Original features: kept, changed, removed

- Kept and improved: diya lighting, fireworks, shareable personal link, creator credit (text only).
- Replaced: the double-tap rocket (not keyboard accessible), the six-second forced intro, the random-wish-by-chance letter.
- Not carried over yet: lantern release, "more fireworks" bursts, sound. Sound needs an explicit opt-in control and tested audio, so it was left out rather than shipped half-done.

## Problems found in the original

No tests, dependencies, licence, assets or config existed; only `index.html` (with inline JS), `style.css` and a 3-line `README.md`. Issues: scrolling disabled and text selection blocked; diya was a clickable `div`; rocket needed a double tap; sound on by default; fireworks canvas looped forever; auto-firework interval never stopped; Google Fonts loaded from a third party; share links dropped Devanagari names (only A-Z/0-9 kept); `share` swallowed errors and claimed "Link copied" without checking; reduced motion covered three selectors and no JavaScript; no meta description, favicon or social tags; `lang="hi"` on mostly English text.

## Folder structure

```
index.html    page, all screens, SEO tags
style.css     design tokens and layout
app.js        screen flow, creator, card, sharing, fireworks
codec.js      encodes/decodes the greeting for the link (also used by tests)
favicon.svg   icon
robots.txt    allows crawling
tests/codec.test.js
```

## Run locally

Easiest: `python3 -m http.server 8000` in this folder, then open http://localhost:8000. Double-clicking `index.html` also works in most browsers.

## Deploy

Upload the files to any static host (GitHub Pages, Netlify, Cloudflare Pages, any web server). Use HTTPS: the Copy button needs it.

## Set the real site URL

No domain is assumed. Once you have one, add these to `<head>` in `index.html`: `<link rel="canonical" href="https://YOUR-DOMAIN/">`, `<meta property="og:url" content="https://YOUR-DOMAIN/">`, and an `og:image` (absolute URL to a 1200x630 image you create). Then add `sitemap.xml` and a `Sitemap:` line in `robots.txt`.

## Change the greeting text

Edit the `T` object at the top of `app.js`. Keep messages under 280 characters.

## Add a language safely

1. Add an entry to `T` (title, "Dear", share line, six messages). 2. Add a radio button in `index.html`. 3. Allow the code in `codec.js` (`o.l === 'hi' ? 'hi' : 'en'`). 4. Have a fluent speaker review every line. The Hindi lines were written for this project and should be checked by a native reader before launch.

## Known limitations

- Link previews (WhatsApp, Instagram) are generic: a static site cannot give each URL fragment its own preview.
- No download-as-image yet. Long Devanagari or emoji messages make long links.
- Fonts are system fonts; Hindi looks best on devices with a Devanagari font (all current phones have one).
- Fixed-position effects were not tested on real devices.

## Testing

`node tests/codec.test.js` runs 16 checks: Hindi, accents, apostrophes, emoji, empty fields, malformed fragments, limits, control characters.
Manual checklist before launch: keyboard-only run through every screen; screen reader (TalkBack/VoiceOver); 320 px to desktop widths; reduced-motion on; slow 3G throttling; real share sheet on a phone; Lighthouse and WebPageTest for LCP, INP and CLS. No accessibility or performance results are claimed here.

## Privacy

No accounts, cookies, analytics or third-party requests. Names and message are inside the link as base64url JSON. That is encoding, not encryption: anyone with the link can read it. The form says so. Add a privacy note if you later add analytics.

## Licences

All artwork is original inline SVG. No external fonts or images. Code: add your own licence file before publishing.

## Launch checklist

Real domain and canonical/OG tags; social image; native-speaker review of Hindi; device and screen-reader test; share a test card through WhatsApp; short screen recording of the diya and card for Instagram/Reels; QR code to the live URL for festival posters; post only where self-promotion is allowed; ask friends for feedback on one change at a time. No bots, bought traffic or bulk messaging.
