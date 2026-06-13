# Image Variant v4.1.3

**100% Pure Camera Angles & Framing • English UI • French SEO • Zero Filters**

A fully client-side web tool that lets you generate up to 24 image variants using **only real camera geometry** (different crops, zooms, rotations, and framings). No filters, no lighting effects, no color changes — every visual difference comes from authentic camera work.

French SEO metadata (Alt Text, Title, Caption, Description) is **directly mapped** to the exact camera angle you choose for each variant, with 100% uniqueness enforced across the entire batch.

## ✨ Features

- Full manual control: Set 1–24 variants and assign any of the 24 specific camera angles to each one
- "Randomize All Unique Camera Angles" button
- Pure geometric rendering (crop + rotation only) — images never stretch or distort
- Per-variant 🔎 Fetch / ✨ Generate / ⬇️ Download buttons
- Live SEO table with character counters
- Multi-format support: Upload PNG/JPG/WEBP, export as JPG/PNG/WEBP
- Batch ZIP export (images + metadata.txt + CSV) and separate CSV export
- All processing happens in your browser — nothing is uploaded to any server

## 🚀 How to Use (Local or GitHub Pages)

1. Open `index.html` in any modern browser (double-click works locally).
2. (Optional) Drag & drop your base images into the dropzone.
3. Set the number of variants (1–24).
4. For each variant, choose the exact camera angle from the dropdowns (or click **🎲 Randomize All Unique Camera Angles**).
5. Click **✨ Generate Variants with the Camera Angles You Assigned**.
6. Review the gallery and the French SEO table (the "Visual Concept" column shows exactly what you chose).
7. Use the export buttons or per-variant download buttons.

## 📁 Project Structure

```
image-variant/
├── index.html
├── css/
│   └── main.css
├── js/
│   ├── app.js
│   └── jszip.min.js
├── assets/
│   ├── favicon.png
│   └── logo.png
└── README.md
```

## 🌐 Deploy on GitHub (Recommended)

This project is pure static HTML/CSS/JS — perfect for **GitHub Pages** (free hosting).

### Quick Steps

1. Create a new public repository on GitHub (e.g. `image-variant`).
2. Upload all files from this folder (or push via git).
3. Go to your repo → **Settings** → **Pages**.
4. Under "Build and deployment", set **Source** to `Deploy from a branch` → Branch: `main` → Folder: `/ (root)`.
5. Click **Save**.
6. Wait 1–2 minutes. Your live URL will be:  
   `https://YOUR_USERNAME.github.io/image-variant/`

You can now open the system directly from GitHub and share the link with anyone.

## 🔄 Updating the Live Version

Just edit files locally, then push/commit the changes to the `main` branch. GitHub Pages will automatically rebuild and update the site within a few minutes.

## 📝 Notes

- 100% client-side. No backend, no API keys, no data collection.
- Works offline after the first load (when running locally).
- All 24 camera angles produce unique geometric variations.
- French SEO sentences are complete, grammatically correct, and uniquely generated per camera concept.

## License

Free to use for personal and commercial projects.

---

Made with ❤️ for precise camera control and clean French SEO.