# Hamza Jamil — DevOps / SRE Portfolio

A static, single-page portfolio built around a "control plane / operations dossier" visual system: graphite surfaces, acid-lime accents, a fixed desktop rail, an instrument-style telemetry panel, and a boot sequence on first load.

No build step, no npm, no framework compilation. GitHub Pages serves `index.html` directly from the repository root.

## Files

```
.
├── index.html
├── README.md
└── assets/
    ├── css/
    │   └── styles.css
    ├── js/
    │   └── main.js
    └── img/
        ├── favicon.svg
        ├── apple-touch-icon.png
        ├── og-cover.png
        ├── hamza-jamil.jpg
        ├── monitoring-architecture.jpg
        └── patroni-topology.jpg
```

---

## Deploy to GitHub Pages

The site is designed to replace the existing `index.html` in the current Pages repository.

1. Copy the contents of this folder into the repository root, keeping the `assets/` folder intact:

   ```bash
   cp -R index.html README.md assets /path/to/Dev0ps-Portfolio/
   ```

2. In the repository, confirm the deployment branch and folder:

   ```bash
   git status
   git add index.html README.md assets
   git commit -m "Rebuild portfolio as an animated operations dossier"
   git push origin main
   ```

3. Open the repository on GitHub:

   **Settings → Pages → Build and deployment**

4. Set:

   - **Source:** `Deploy from a branch`
   - **Branch:** `main`
   - **Folder:** `/ (root)`

5. Click **Save** and wait for the Pages build to finish. The site will be served at:

   ```
   https://<username>.github.io/<repository>/
   ```

   For this repo, confirm the canonical URL matches the address shown in the Pages settings.

6. Re-check these placeholders after the first deploy:

   - `<link rel="canonical">` in `index.html`
   - `og:url`
   - `og:image` and `twitter:image` (absolute URL required by social platforms)
   - `twitter:image`

   If you use a custom domain, add it in **Settings → Pages → Custom domain** and update the same URLs.

7. Re-scrape the social card after changing the OG image:

   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

---

## Preview locally

From the project root:

```bash
python3 -m http.server 8000
```

Then open <http://127.0.0.1:8000/>. A local server is required for the absolute asset paths and the clipboard API; opening `index.html` via `file://` will not test everything correctly.

---

## What is included

- **Boot intro** — short terminal sequence on first visit per session, skippable by click, key, or scroll. It does not replay within the same session.
- **GSAP 3.12.5 + ScrollTrigger** — pinned on cdnjs, loaded with `defer`. The page remains fully readable if the CDN or JavaScript fails.
- **Scroll choreography** — masked hero lines, traced telemetry links, section headings, matrix rows, release bullets, case blocks, training records and contact rows animate once as they enter the viewport. Case figures drift at a different rate from the copy, and the hero grid moves on scroll.
- **Interactive motion** — on a mouse-driven desktop the telemetry panel tilts subtly toward the pointer, and the tech ticker leans into fast scrolls before settling.
- **Theme switching** — dark by default, light theme respects `prefers-color-scheme` on first visit, and the choice is saved in `localStorage` inside `try/catch`.
- **Command palette** — open with `Ctrl K` / `⌘ K` or the rail/topbar button. Search sections and actions with the keyboard; `Esc` closes it.
- **Accessible image lightbox** — case-study diagrams can be enlarged. Focus is trapped while open, `Esc` and backdrop clicks close it, and focus returns to the trigger.
- **Instrument-style case studies** — observability, AWS delivery path, Patroni HA PostgreSQL, and production VM deployment.
- **Responsive layout** — fixed rail above 1120px; compact topbar and slide menu below. The pipeline and request-path diagrams switch from a single row to a wrapped two-column grid below 980px, so no stage is hidden behind horizontal scrolling. Layouts were checked from 320px to 1440px with no horizontal overflow.
- **Mobile interaction** — 44px topbar controls, 48px menu rows, a full-width action stack, and focus-managed palette and lightbox panels that fit a 360px viewport.
- **Reduced motion** — all GSAP motion, the typewriter, counters, parallax, pointer tilt, ticker lean, and the intro are disabled when `prefers-reduced-motion: reduce` is set.

All content uses the supplied facts only. Employer systems are described generically as national-scale transport infrastructure; no internal hostnames, IPs, credentials, or customer names are included.

---

## Content TODOs

These are intentional placeholders. Do not invent the missing values.

1. **Canonical / social URLs** — confirm the final GitHub Pages or custom-domain address after the first deploy.
2. **AWS project repository** — the AWS delivery project is marked as a training project. Add a "View on GitHub" link only if a public repository exists.
3. **AWS course year** — the training record shows `year n/a` because no date was supplied. Replace it with the real year if you want it displayed.
4. **Pipeline verification** — the AWS case study describes the documented toolchain (GitHub → Jenkins → Trivy → Docker Hub → Kubernetes). Confirm the pipeline details still match the source project before publishing.

---

## Accessibility and performance notes

- One `<h1>`, ordered headings, a skip link, visible focus styles, and labelled controls.
- Text contrast passes WCAG AA in both themes.
- All images have descriptive alternative text and explicit dimensions.
- The monitoring and Patroni diagrams are lazy-loaded; the portrait is lazy-loaded as well.
- Motion uses transforms and opacity, plays once per element, and refreshes after fonts and images load. A deep link that jumps past content still reveals it.
- Mobile browser chrome changes are ignored by ScrollTrigger so the layout does not jump while scrolling.
- No analytics, trackers, or third-party JavaScript beyond the pinned GSAP files.
- Page weight is comfortably below 1.5 MB excluding the monitoring diagram.

## Credits

- Portrait, monitoring diagram, and Patroni diagram: supplied by Hamza Jamil.
- GSAP and ScrollTrigger: [cdnjs](https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/), pinned to `3.12.5`.
- Fonts: Space Grotesk, Inter, and JetBrains Mono via Google Fonts.
- Favicon, Apple touch icon, and the Open Graph cover are generated from the site's own graphite/lime visual system.
