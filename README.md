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

From the `site` directory, run:

```sh
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## HoneyBook

The homepage estimate section currently contains a visual placeholder form. It does not send submissions. Replace it with the HoneyBook embed before moving the live domain away from Squarespace.

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
