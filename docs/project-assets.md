# Project gallery assets

The gallery uses six existing local WebP files and eight original SVG concept
covers from `public/projects`. Existing raster images were visually inspected
and their dimensions measured with the repository's installed `sharp` package.
No image generation service was used for the eight new vector illustrations.

Titles, categories, and the year `2026` are working gallery metadata. Penvo's
own branded mockups are identified as Penvo; the remaining twelve examples are
explicitly identified as concepts. These entries do not claim external client
commissions, completed case studies, measured results, or a released Penvo app.

## Served files

| File                     | Dimensions  | File size     | Visible content                                                     |
| ------------------------ | ----------- | ------------- | ------------------------------------------------------------------- |
| `penvo-identity.webp`    | 1484 × 1060 | 196,094 bytes | Orange hoodie bearing Penvo's white logo.                           |
| `penvo-digital.webp`     | 1000 × 1344 | 37,142 bytes  | Smartphone home screen with an orange Penvo app icon.               |
| `wellness-digital.webp`  | 1536 × 1024 | 126,894 bytes | Botanical website concept displayed on a desktop monitor.           |
| `paper-and-print.webp`   | 1536 × 1024 | 149,628 bytes | Cream stationery with black and orange geometric graphics.          |
| `packaging-concept.webp` | 1536 × 1024 | 95,680 bytes  | Amber bottle and cartons with cream, orange, and black packaging.   |
| `campaign-concept.webp`  | 1536 × 1024 | 263,026 bytes | Outdoor portrait with an orange rain jacket, forest, and waterfall. |

## Verified local originals

Matching original mockups were found in the user's existing Penvo branding
folder:

- `penvo-identity.webp` matches
  `/Users/anas/Downloads/Penvo/Branding/Mockups/Jacket.png`, 1484 × 1060.
  Although the source filename says “Jacket,” the visible garment is a hoodie.
- `penvo-digital.webp` matches
  `/Users/anas/Downloads/Penvo/Branding/Mockups/Mobile App.png`, 1082 × 1454.
  The served version is smaller and depicts a brand mockup rather than an
  independently verified live application.

Source and served files were compared as normalized 64 × 64 RGB thumbnails.
Their mean channel differences were approximately 0.91 and 2.36 on the
0–255 scale, respectively, consistent with the matching compositions after
WebP compression and resizing. The original export commands and quality
settings were not recovered.

## Concept provenance

The four concept files already existed in `public/projects` when inspected.
Their upstream files, generation tool, prompts, generation dates, and export
settings were not independently recovered from the local files searched.
No specific source or prompt is asserted here.

If original files or generation records are later supplied, add the verified
source and transformation details to this inventory. Keep the public concept
labels until approved project identities and case-study copy are available.

## Original vector concepts

Eight standalone SVG illustrations were created in this repository using its
Penvo monogram paths and orange, black, white, and neutral palette. They are
graphic concept applications, with no external assets, scripts, or dependencies.
All have a 1200 × 900 viewBox and support square or landscape cropping.

| File                     | Example                              |
| ------------------------ | ------------------------------------ |
| `editorial-concept.svg`  | Journal cover and editorial identity |
| `social-concept.svg`     | Social campaign poster graphics      |
| `retail-concept.svg`     | Storefront and window signage        |
| `merch-concept.svg`      | Branded tote bag illustration        |
| `dashboard-concept.svg`  | Analytics dashboard interface        |
| `event-concept.svg`      | Event ticket and identity            |
| `coffee-concept.svg`     | Coffee packaging and label graphics  |
| `wayfinding-concept.svg` | Architectural directional signage    |

## Rendering

`projects-content.ts` records the served width and height, descriptive image
alternative text, and card shape for each entry. The gallery uses local
`next/image` sources with responsive sizing and intrinsic image frames. No
remote image host or case-study destination is required for these previews.
