# Whatcom House Plans Static Website

This website is built entirely with HTML, CSS, and vanilla JavaScript. It does not require Squarespace, a JavaScript framework, or a build process.

## Project Structure

- `index.html`: Homepage content and SEO metadata
- `stock-plans-1/index.html`: Stock plans page at `/stock-plans-1`
- `styles.css`: Shared design system and responsive layouts
- `script.js`: Mobile navigation, FAQ accordions, and footer year
- `assets/`: Local optimized website images
- `robots.txt`: Search-engine crawling instructions
- `sitemap.xml`: Search-engine page inventory
- `_redirects`: Cloudflare Pages redirects preserving old Squarespace URLs
- `404.html`: Custom not-found page

## Design System

- Eurostile Heavy is used sparingly for the homepage hero and final estimate CTA.
- Montserrat is hosted locally and used for navigation, headings, body text, and buttons.
- Global colors, maximum content widths, and spacing values live near the top of `styles.css`.
- Gallery and review carousel items live in `index.html`. Duplicate an existing `.carousel-slide` to add another image or review; the controls and counter update automatically.

## Preview Locally

From the repository root, run:

```sh
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## HoneyBook

The homepage estimate section contains the HoneyBook inquiry form. Verify a real test submission on the Cloudflare Pages preview before moving the live domain away from Squarespace.

## Deploy To Cloudflare Pages

1. Create a GitHub repository and upload the contents of this `site` directory.
2. In Cloudflare, open **Workers & Pages** and create a Pages project.
3. Connect the GitHub repository.
4. Set the production branch to `main`.
5. Set the framework preset to `None`.
6. Set the build command to `exit 0`.
7. Set the output directory to `.`.
8. Leave the root directory blank and do not add environment variables.
9. Deploy and review the temporary `pages.dev` address.

## Move The Existing Domain

Do not cancel Squarespace hosting until the new website is verified.

1. Add `whatcomhp.com` and `www.whatcomhp.com` as custom domains in Cloudflare Pages.
2. Review the existing Squarespace DNS records before changing anything.
3. Preserve all email-related `MX`, `TXT`, SPF, DKIM, and DMARC records.
4. Update only the website records requested by Cloudflare.
5. Verify both domain versions, HTTPS, navigation, phone links, and email links.
6. Submit `https://www.whatcomhp.com/sitemap.xml` in Google Search Console.
7. Cancel Squarespace website hosting after the new website has been stable for several days.

The domain registration can remain at Squarespace initially. It can be transferred to another registrar separately later.

## Code quality and verification

The site stays static: Node.js is only needed for development checks, not to
serve the website. Use Node.js 22 or later, npm, and Python 3.10 or later:

```sh
npm ci
npx playwright install --only-shell chromium
npm run check
npm test
```

On Linux CI, install browser system dependencies too with
`npx playwright install --with-deps --only-shell chromium`.
The check command runs focused ESLint, Stylelint and HTML Validate rules,
then validates local references, IDs, image alternative-text attributes, CSS
assets, sitemap entries and redirect destinations with Python. These checks
do not emulate Cloudflare redirect/header handling or validate every rule.
Browser tests use a loopback-only fixture server and block third-party requests,
including HoneyBook: no real inquiries are sent.

The checks exercise navigation focus/Escape/resizing, FAQ expansion and access
without JavaScript, independent carousels and malformed-component fallback,
reduced motion, page loading, and existing phone/email links. These are focused
regression checks, not a claim of complete accessibility conformance or a test
of inquiry delivery. Before deployment, check HoneyBook on the intended preview
separately; a visible form alone does not establish delivery.

## Implementation boundaries

- Navigation owns the mobile overlay state, keyboard focus, background
  interaction, and resetting state across the mobile breakpoint.
- FAQ behavior enhances existing answers only when its controlled element
  exists; otherwise the answer stays readable.
- Each carousel validates its markup before enhancement, owns its current
  slide, and announces user-triggered changes. Inactive slides remain in the
  visual track but are excluded from assistive-technology navigation. If
  enhancement is unavailable, the original slides remain readable in sequence.
- The shared script tolerates pages without these components. The 404 page
  needs no JavaScript. No framework or production build was introduced.

## Development approach and scope

This website was developed with substantial AI assistance. Dana directed the
business requirements, content and design. Code and automated checks were
produced with AI assistance; their existence does not imply independent code
or test authorship. The code-quality pass preserves the established customer
content and normal appearance while improving keyboard behavior, resilience
and repeatable verification.

Fonts, photographs, renderings and other business assets are retained as
supplied by the owner. This repository does not grant a blanket license to
redistribute them. No open-source code license has been selected. Deployment
configuration and business integrations are distinct from permission to reuse
source or assets.

### Accessibility scope

Axe checks the three pages at a mobile viewport. Known color-contrast findings
from the original design are recorded by exact target in the regression
baseline; the test rejects new or changed findings rather than silently
suppressing the contrast rule. Fixing those colors is outside this code-only
pass. The missing top-level heading on the 404 page was corrected without
changing its visible text or styling. Keyboard checks verify a focus indicator
on menu links, FAQ buttons and carousel controls. This is bounded evidence,
not a claim of full accessibility conformance or a substitute for assistive
technology testing.
