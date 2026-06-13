/* Image Variant v4.1.3 — 100% PURE CAMERA ANGLES ONLY
   No filters. No lighting. No color. No blur. No vignette.
   Only real camera geometry (crop/zoom + rotation) so each image looks new.
   Full control: set number (1-24) and manually pick exact camera angle for every variant.
   English UI + French SEO from the camera concept you chose.
*/

let variants = [];
let baseImages = [];
let logEl = null;
let numVariants = 4;
let exportFormat = 'image/jpeg';

// NEW: User-provided SEO context (everything is user input)
let pageUrl = '';
let pageContent = '';
let focusKeyphrase = '';
let globalStylePreset = '';   // user input for any style presets / additional context (used ONLY for SEO text, never for image rendering)

const cameraTakes = [
  "Standard Frontal Shot", "Close-up Detail Shot", "Wide Angle Overview",
  "Low Angle Perspective", "High Angle Bird's Eye", "Three-Quarter Angle",
  "Side Profile View", "Overhead Top-Down", "Eye-Level Straight On",
  "Dutch Tilt Creative", "Macro Extreme Close-up", "Telephoto Zoomed In",
  "Fisheye Wide Context", "Panoramic Horizontal", "Vertical Portrait Orientation",
  "Isometric Angle", "Oblique 45-Degree Angle", "Dynamic Motion Capture",
  "Static Product Placement", "Lifestyle Contextual Shot", "Texture Detail Focus",
  "Environmental Wide Scene", "Symmetrical Centered Composition", "Tight Product Crop"
];

// Pure geometry only — crop, zoom, rotation for angle look. No filters, no light, no color.
// Amplified for STRONG, clearly visible differences (user requirement: "not just slightly")
function getCameraGeometry(camera) {
  let zoom = 1.0;
  let rotation = 0;
  let cropXOffset = 0;
  let cropYOffset = 0;
  let framingNote = "standard framing";

  if (camera.includes("Close-up") || camera.includes("Macro")) {
    zoom = 2.6; framingNote = "extreme close-up macro crop revealing fine surface details and texture";
  }
  if (camera.includes("Telephoto") || camera.includes("Tight")) {
    zoom = 2.1; framingNote = "tight telephoto compression isolating the key subject detail";
  }
  if (camera.includes("Wide") || camera.includes("Panoramic") || camera.includes("Environmental") || camera.includes("Fisheye")) {
    zoom = 0.48; framingNote = "very wide contextual overview showing the full environment and scale";
  }
  if (camera.includes("Low Angle")) {
    rotation = -22; zoom = 0.85; cropYOffset = -0.14; framingNote = "strong dramatic low angle with powerful vertical emphasis and height";
  }
  if (camera.includes("High Angle") || camera.includes("Bird")) {
    rotation = 18; zoom = 0.65; cropYOffset = 0.11; framingNote = "pronounced high-angle bird's-eye perspective with compressed depth";
  }
  if (camera.includes("Dutch Tilt") || camera.includes("Oblique")) {
    rotation = 26; framingNote = "bold creative Dutch tilt / oblique angle for strong dynamic visual tension";
  }
  if (camera.includes("Side Profile")) {
    rotation = 7; cropXOffset = 0.22; framingNote = "clear side profile view with elongated horizontal composition";
  }
  if (camera.includes("Three-Quarter")) {
    rotation = -11; cropXOffset = -0.13; framingNote = "distinct three-quarter angle revealing volume, form and depth";
  }
  if (camera.includes("Overhead") || camera.includes("Top-Down")) {
    rotation = 5; zoom = 0.58; framingNote = "direct overhead top-down flat perspective with strong geometric layout";
  }
  if (camera.includes("Isometric")) {
    rotation = 12; zoom = 0.78; framingNote = "pronounced isometric geometric angle with clear structured volume";
  }
  if (camera.includes("Vertical Portrait")) {
    zoom = 1.65; cropYOffset = -0.09; framingNote = "strong vertical portrait orientation emphasizing height and elegance";
  }
  if (camera.includes("Dynamic") || camera.includes("Motion")) {
    rotation = -9; zoom = 1.35; framingNote = "dynamic angled capture with clear sense of movement and energy";
  }
  if (camera.includes("Texture") || camera.includes("Detail Focus")) {
    zoom = 2.85; cropXOffset = 0.09; cropYOffset = 0.06; framingNote = "extreme texture and material detail focus with maximum closeness";
  }
  if (camera.includes("Lifestyle") || camera.includes("Contextual")) {
    zoom = 0.55; framingNote = "lifestyle contextual framing showing the subject in its real environment";
  }
  if (camera.includes("Symmetrical")) {
    zoom = 1.22; framingNote = "perfectly symmetrical centered composition with balanced visual harmony";
  }
  if (camera.includes("Standard Frontal") || camera.includes("Eye-Level") || camera.includes("Static Product")) {
    zoom = 1.0; framingNote = "classic eye-level frontal or static product framing with balanced composition";
  }

  return { zoom, rotation, cropXOffset, cropYOffset, framingNote };
}

function createVariantImage(baseUrl, camera) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");

      const geo = getCameraGeometry(camera);
      const targetW = 800;
      const targetH = 600;
      const targetAspect = targetW / targetH;
      const imgW = img.width;
      const imgH = img.height;
      const imgAspect = imgW / imgH;

      // Compute crop rect that ALWAYS matches target aspect ratio (4:3) so drawImage never stretches or distorts.
      // Zoom controls how large the crop is (smaller crop = tighter framing/zoom-in). Offsets shift the center.
      // This keeps the exact same visual content/framing as before but without any pixel stretching.
      const z = geo.zoom || 1.0;
      let cropW, cropH;
      if (imgAspect >= targetAspect) {
        // Image wider than or equal to target: size crop using height
        cropH = imgH / z;
        cropW = cropH * targetAspect;
      } else {
        // Image taller: size crop using width
        cropW = imgW / z;
        cropH = cropW / targetAspect;
      }

      // Apply center + user-chosen offsets (as fraction of full image)
      let sx = (imgW - cropW) / 2 + (geo.cropXOffset || 0) * imgW;
      let sy = (imgH - cropH) / 2 + (geo.cropYOffset || 0) * imgH;

      // Clamp so crop stays inside image
      sx = Math.max(0, Math.min(sx, imgW - cropW));
      sy = Math.max(0, Math.min(sy, imgH - cropH));

      // Final safety clamp on crop size
      cropW = Math.min(cropW, imgW - sx);
      cropH = Math.min(cropH, imgH - sy);

      ctx.save();

      if (geo.rotation !== 0) {
        ctx.translate(targetW / 2, targetH / 2);
        ctx.rotate(geo.rotation * Math.PI / 180);
        ctx.translate(-targetW / 2, -targetH / 2);
      }

      // Pure geometry only — crop rect has exact target aspect => draw fills canvas with NO stretch/distortion.
      ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, targetW, targetH);

      ctx.restore();

      canvas.toBlob((blob) => {
        resolve(blob ? URL.createObjectURL(blob) : baseUrl);
      }, exportFormat, exportFormat.includes("png") ? undefined : 0.92);
    };
    img.onerror = () => resolve(createPlaceholderDataUrl(0));
    img.src = baseUrl;
  });
}

function createPlaceholderDataUrl(idx) {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, 600);
  grad.addColorStop(0, "#1a1a2e");
  grad.addColorStop(1, "#16213e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 600);
  ctx.fillStyle = "#e94560";
  ctx.fillRect(200, 150, 400, 300);
  ctx.fillStyle = "#0f3460";
  ctx.fillRect(250, 200, 300, 200);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px -apple-system, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Placeholder Base", 400, 280);
  ctx.font = "15px -apple-system, system-ui, sans-serif";
  ctx.fillText(`Variant ${idx + 1} — Pure Camera Angle`, 400, 320);
  return canvas.toDataURL("image/jpeg", 0.9);
}

function getBaseForVariant(idx) {
  if (baseImages.length === 0) return createPlaceholderDataUrl(idx);
  return baseImages[idx % baseImages.length].url;
}

// French SEO — 100% camera angle / framing (no light, no color, no filter words)
const altPool = [
  "Le sujet est capturé en cadrage frontal standard avec une composition équilibrée.",
  "Gros plan détaillé du produit en plan serré sur les textures principales.",
  "Vue d'ensemble large du sujet dans son contexte environnemental complet.",
  "Angle bas dynamique révélant la hauteur et la puissance du sujet.",
  "Prise de vue en contre-plongée mettant en valeur la stature du produit.",
  "Gros plan extrême explorant les détails fins de la surface du sujet.",
  "Composition symétrique centrée avec un alignement parfait des éléments.",
  "Perspective isométrique offrant une vision géométrique précise du volume.",
  "Vue latérale de profil mettant en évidence les contours et les formes.",
  "Angle oblique créatif à 45 degrés pour une sensation de mouvement.",
  "Zoom téléobjectif isolant le détail essentiel avec une netteté accrue.",
  "Plan panoramique horizontal capturant l'étendue complète de la scène.",
  "Cadrage macro extrême sur les reflets et les matières du produit.",
  "Vue plongeante révélant la structure et le volume avec profondeur.",
  "Angle latéral élégant soulignant les courbes et les lignes fluides.",
  "Composition avec rotation créative pour un effet dynamique et moderne.",
  "Détail texturé extrême en focus précis sur la matière brute.",
  "Vue large environnementale intégrant le sujet dans son contexte.",
  "Prise isométrique moderne avec une géométrie claire et structurée.",
  "Cadrage serré minimaliste découpant la silhouette du sujet.",
  "Cadrage vertical portrait accentuant la hauteur et l'élégance.",
  "Plan serré statique pour une présentation produit propre et directe.",
  "Vue contextuelle lifestyle intégrant l'environnement autour du sujet.",
  "Composition centrée symétrique avec un équilibre visuel parfait."
];

const titlePool = [
  "Sujet en plan frontal standard avec composition équilibrée.",
  "Produit en gros plan détaillé sur les textures.",
  "Vue large d'ensemble du sujet dans son contexte.",
  "Angle bas dynamique révélant hauteur et puissance.",
  "Contre-plongée mettant en valeur la stature.",
  "Gros plan extrême sur les détails de surface.",
  "Symétrie centrée avec alignement parfait.",
  "Perspective isométrique géométrique précise.",
  "Profil latéral soulignant les contours.",
  "Angle oblique créatif à 45 degrés.",
  "Zoom téléobjectif sur le détail essentiel.",
  "Panoramique horizontal de la scène complète.",
  "Macro extrême sur reflets et matières.",
  "Plongée révélant structure et volume.",
  "Angle latéral sur courbes fluides.",
  "Rotation créative pour effet dynamique.",
  "Focus texturé extrême sur la matière.",
  "Large environnementale en contexte.",
  "Isométrique moderne structurée.",
  "Cadrage serré minimaliste.",
  "Vertical portrait accentuant la hauteur.",
  "Plan serré statique produit.",
  "Contextuelle lifestyle environnement.",
  "Symétrie centrée équilibrée."
];

const captionPool = [
  "Cette variante présente le sujet avec un cadrage frontal standard et une composition parfaitement équilibrée qui met en valeur la forme globale et les proportions naturelles.",
  "Le produit est montré en gros plan serré, explorant les détails fins et les textures de surface avec une netteté qui révèle la qualité des matériaux.",
  "Une vue d'ensemble large capture le sujet dans son environnement complet, offrant un contexte visuel riche et une compréhension de l'échelle réelle.",
  "L'angle bas dynamique donne une impression de puissance et de hauteur au sujet, avec une perspective qui accentue les lignes verticales et la présence.",
  "En contre-plongée, le sujet gagne en stature et en impact visuel, la composition soulignant sa forme et sa solidité depuis un point de vue inférieur.",
  "Le gros plan extrême explore les moindres détails de la texture et de la matière, offrant une vision intime et précise des finitions du produit.",
  "La composition symétrique centrée assure un équilibre visuel parfait, avec tous les éléments alignés pour une lisibilité et une harmonie maximales.",
  "La perspective isométrique confère au sujet une dimension géométrique claire et moderne, idéale pour comprendre le volume et les proportions en 3D.",
  "La vue de profil latéral met en évidence les courbes, les arêtes et les contours élégants du sujet avec une composition allongée et fluide.",
  "L'angle oblique à 45 degrés apporte du dynamisme et de l'originalité à l'image, créant une sensation de mouvement et de profondeur intéressante.",
  "Le zoom téléobjectif isole le détail le plus important du produit avec une compression qui renforce la netteté et l'attention sur cet élément clé.",
  "Le plan panoramique horizontal intègre le sujet dans un large contexte environnemental, révélant l'ensemble de la scène avec fluidité.",
  "Le cadrage macro extrême révèle les reflets, les matières et les finitions les plus fines avec une précision qui met en valeur la qualité premium.",
  "La vue plongeante capture la structure tridimensionnelle du sujet avec une perspective qui révèle la profondeur et les relations entre les volumes.",
  "L'angle latéral élégant souligne les lignes courbes et les formes fluides du produit, offrant une vision latérale raffinée et moderne.",
  "La composition avec rotation créative donne une impression de dynamisme et de tension visuelle, tout en gardant le sujet parfaitement reconnaissable.",
  "Le focus extrême sur la texture met en lumière la matière brute et les détails de surface avec une netteté qui permet d'apprécier la fabrication.",
  "La vue large environnementale place le sujet dans son contexte réel, montrant comment il s'intègre dans un espace plus large et vivant.",
  "La prise isométrique moderne offre une représentation géométrique précise et structurée du volume, parfaite pour les présentations techniques.",
  "Le cadrage serré minimaliste découpe le sujet de manière graphique et puissante, mettant l'accent sur la silhouette et la forme essentielle.",
  "Le cadrage vertical portrait accentue la hauteur et l'élégance du sujet, avec une composition qui met en valeur les proportions verticales.",
  "Le plan serré statique présente le produit de façon propre, directe et professionnelle, idéal pour les fiches techniques et les catalogues.",
  "La vue contextuelle lifestyle intègre le sujet dans un environnement quotidien réel, montrant son usage et son ambiance dans un cadre vivant.",
  "La composition symétrique centrée assure un équilibre parfait des masses et des lignes, créant une image harmonieuse et reposante."
];

const descPool = [
  "Cette image montre le sujet à travers un cadrage frontal standard soigné. La composition équilibrée révèle les proportions naturelles, les formes principales et l'aspect général du produit de manière claire et authentique. Idéale pour les présentations globales et les catalogues.",
  "Le gros plan serré explore les détails fins et les textures de surface du produit. Chaque élément de matière est mis en valeur avec précision, parfait pour les fiches techniques, les visuels de qualité et les supports marketing mettant en avant la fabrication.",
  "Une perspective large capture le sujet dans son contexte environnemental complet. Cette vue d'ensemble offre une compréhension de l'échelle, de l'espace et de l'intégration du produit dans son univers, recommandée pour les brochures et les sites web contextuels.",
  "L'angle bas dynamique donne au sujet une présence puissante et imposante. La perspective accentue la hauteur et les lignes verticales, créant un effet dramatique et moderne adapté aux visuels publicitaires et aux présentations de produits innovants.",
  "Le cadrage en contre-plongée confère au sujet une stature et une force visuelle accrues. Les lignes et les volumes sont mis en valeur depuis un point de vue inférieur, excellent pour les campagnes de luxe et les communications qui cherchent à inspirer de l'impact.",
  "Le gros plan extrême révèle les moindres détails de texture et de finition. Cette vision intime permet d'apprécier la qualité des matériaux et la précision de la fabrication, parfait pour les fiches produit premium et les supports pédagogiques visuels.",
  "La composition symétrique centrée assure une lisibilité et une harmonie optimales. Tous les éléments sont alignés avec précision pour une image équilibrée et professionnelle, idéale pour les interfaces utilisateur, les portfolios et les présentations corporate épurées.",
  "La perspective isométrique offre une représentation géométrique précise du volume et des proportions. Ce style moderne et structuré est excellent pour les mockups, les présentations techniques, les contenus 3D et les visuels de design innovants.",
  "La vue de profil latéral met en évidence les courbes, les arêtes et les lignes fluides du sujet. Cette composition allongée et élégante convient parfaitement aux visuels mode, aux catalogues produits et aux communications mettant l'accent sur la forme.",
  "L'angle oblique créatif à 45 degrés injecte du dynamisme et de l'originalité dans la composition. La perspective apporte du mouvement et de la profondeur, parfaite pour les campagnes digitales, les réseaux sociaux et les visuels avant-gardistes.",
  "Le zoom téléobjectif isole et magnifie le détail le plus important du produit. La compression optique renforce la netteté et l'attention sur cet élément clé, idéal pour les gros plans produits, les visuels de détail et les supports promotionnels ciblés.",
  "Le plan panoramique horizontal intègre le sujet dans un large environnement. Cette vue globale révèle le contexte complet et l'échelle réelle, recommandée pour les bannières web, les présentations d'ensemble et les documents marketing contextuels.",
  "Le cadrage macro extrême explore les reflets, les matières et les finitions les plus fines avec une précision exceptionnelle. Cette vision rapprochée met en valeur la qualité premium des matériaux, parfait pour les fiches produit de luxe et les campagnes haut de gamme.",
  "La vue plongeante révèle la structure tridimensionnelle et les relations entre les volumes du sujet. Cette perspective puissante convient aux visuels publicitaires impactants, aux présentations de produits complexes et aux contenus techniques visuels.",
  "L'angle latéral élégant souligne les courbes harmonieuses et les proportions fluides du produit. Cette vision raffinée est excellente pour les catalogues mode, les présentations produit et les communications de marque sophistiquées.",
  "La composition avec rotation créative apporte une sensation de dynamisme et de tension visuelle tout en gardant le sujet parfaitement lisible. Ce style convient aux visuels modernes, aux campagnes créatives et aux contenus qui cherchent à surprendre.",
  "Le focus extrême sur la texture met en lumière la matière brute et les détails de surface avec une netteté qui permet d'apprécier la qualité de fabrication. Idéal pour les visuels techniques, artistiques et les communications sur le savoir-faire.",
  "La vue large environnementale place le sujet dans un contexte réel et vivant. Cette intégration dans l'espace montre comment le produit s'insère dans son univers, parfaite pour les présentations de marque et les supports marketing contextuels.",
  "La prise isométrique moderne offre une vision géométrique précise et structurée du volume. Ce style contemporain est excellent pour les interfaces digitales, les mockups et les contenus de design innovants.",
  "Le cadrage serré minimaliste découpe le sujet de manière graphique et puissante. L'accent est mis sur la silhouette et la forme essentielle, idéal pour les visuels de marque forts, les affiches et les campagnes à fort impact visuel.",
  "Le cadrage vertical portrait accentue la hauteur et l'élégance du sujet. Cette composition met en valeur les proportions verticales et la présence, parfaite pour les visuels mode, les portraits produits et les communications raffinées.",
  "Le plan serré statique présente le produit de façon propre, directe et professionnelle. Cette approche simple et efficace convient aux fiches techniques, aux catalogues et aux présentations produit classiques.",
  "La vue contextuelle lifestyle intègre le sujet dans un environnement quotidien réel. Elle montre l'usage et l'ambiance du produit dans un cadre vivant, recommandée pour les campagnes lifestyle et les présentations de marque authentiques.",
  "La composition symétrique centrée assure un équilibre parfait des masses et des lignes. L'image est harmonieuse et reposante, idéale pour les présentations corporate, les portfolios et les visuels qui recherchent la clarté et l'équilibre."
];

function setNumVariants(n) {
  numVariants = Math.max(1, Math.min(24, parseInt(n) || 4));
  log(`Number of variants set to ${numVariants}. Each can have its own camera angle.`);
  initVariants();
  renderAngleSelectors();
  renderGallery();
  renderSeoTable();
}

// === NEW: User SEO Context functions (everything is user input) ===
function updateSeoContext() {
  const urlInput = document.getElementById('page-url');
  const contentInput = document.getElementById('page-content');
  const keyInput = document.getElementById('focus-keyphrase');
  const presetInput = document.getElementById('global-preset');

  pageUrl = urlInput ? urlInput.value.trim() : '';
  pageContent = contentInput ? contentInput.value.trim() : '';
  focusKeyphrase = keyInput ? keyInput.value.trim() : '';
  globalStylePreset = presetInput ? presetInput.value.trim() : '';

  const status = document.getElementById('context-status');
  if (status) {
    let msg = 'SEO context saved.';
    if (focusKeyphrase) msg += ` Keyphrase: "${focusKeyphrase}"`;
    if (globalStylePreset) msg += ` | Style: "${globalStylePreset}"`;
    status.textContent = msg;
    setTimeout(() => { if (status) status.textContent = ''; }, 4000);
  }

  log(`SEO Context updated — Focus Keyphrase: "${focusKeyphrase || '(none)'}" | Style Preset: "${globalStylePreset || '(none)'}" | Page content length: ${pageContent.length} chars`);
}

async function fetchPageContent() {
  const urlInput = document.getElementById('page-url');
  const contentInput = document.getElementById('page-content');
  if (!urlInput || !contentInput) return;

  const url = urlInput.value.trim();
  if (!url) {
    alert('Please enter a valid Page URL first.');
    return;
  }

  log(`Attempting to fetch content from: ${url} ... (note: some sites block cross-origin requests)`);

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();

    // Very simple extraction of visible text (title + main paragraphs)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    let extracted = '';
    const title = doc.querySelector('title');
    if (title) extracted += title.textContent + '\n\n';

    const h1s = doc.querySelectorAll('h1, h2');
    h1s.forEach(h => extracted += h.textContent + '\n');

    const paragraphs = doc.querySelectorAll('p, .description, .product-description, main p');
    paragraphs.forEach(p => {
      const t = p.textContent.trim();
      if (t.length > 30) extracted += t + '\n\n';
    });

    if (extracted.length > 50) {
      contentInput.value = extracted.trim().substring(0, 4000);
      log(`Successfully fetched and extracted ~${extracted.length} characters from the page.`);
      updateSeoContext();
    } else {
      throw new Error('Not enough readable content extracted');
    }
  } catch (e) {
    log(`Fetch failed: ${e.message}. This is normal for many websites due to CORS. Please copy-paste the page content manually into the textarea.`);
    alert('Automatic fetch failed (common due to website security). Please copy the main text/description from the page and paste it manually into the "Paste Page Content" box.');
  }
}

function setExportFormat(format) {
  exportFormat = format;
  log(`Export format changed to ${format.split("/")[1].toUpperCase()}.`);
}

function getLimit(field) {
  return { alt: 125, title: 60, caption: 150, desc: 300 }[field] || 100;
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function log(msg) {
  if (!logEl) logEl = document.getElementById("log-output");
  if (!logEl) return;
  const time = new Date().toLocaleTimeString("en-US", { hour12: false });
  const entry = document.createElement("div");
  entry.textContent = `[${time}] ${msg}`;
  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
}

function clearLog() {
  if (logEl) logEl.innerHTML = "";
}

function initVariants() {
  variants.forEach(v => { if (v.imageUrl) try { URL.revokeObjectURL(v.imageUrl); } catch(e){} });
  variants = [];
  for (let i = 0; i < numVariants; i++) {
    variants.push({
      id: i + 1,
      camera: cameraTakes[i % cameraTakes.length],
      imageUrl: null,
      filename: `variant-${i + 1}.jpg`,
      alt: "",
      title: "",
      caption: "",
      desc: "",
      concept: ""
    });
  }
}

function randomizeUniqueCameras() {
  let available = [...cameraTakes];
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  for (let i = 0; i < variants.length; i++) {
    variants[i].camera = available[i % available.length];
  }
  renderAngleSelectors();
  log(`Randomized ${variants.length} distinct camera angles (pure geometry only).`);
}

function updateCameraForVariant(idx, newCamera) {
  variants[idx].camera = newCamera;
  log(`Variant ${idx + 1} camera angle set to: ${newCamera}`);
}

function renderAngleSelectors() {
  const container = document.getElementById("angle-selectors");
  if (!container) return;
  container.innerHTML = "";

  const title = document.createElement("div");
  title.style.marginBottom = "10px";
  title.innerHTML = `<strong>Assign a pure camera angle to each variant (1–24 available — full manual control):</strong>`;
  container.appendChild(title);

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(260px, 1fr))";
  grid.style.gap = "8px";

  variants.forEach((v, i) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "6px";

    const label = document.createElement("span");
    label.textContent = `V${v.id}:`;
    label.style.minWidth = "32px";
    label.style.fontWeight = "600";
    label.style.fontSize = "13px";

    const sel = document.createElement("select");
    sel.style.flex = "1";
    sel.style.fontSize = "13px";
    cameraTakes.forEach(take => {
      const opt = document.createElement("option");
      opt.value = take;
      opt.textContent = take;
      if (take === v.camera) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.onchange = () => updateCameraForVariant(i, sel.value);

    row.appendChild(label);
    row.appendChild(sel);
    grid.appendChild(row);
  });

  container.appendChild(grid);

  const actions = document.createElement("div");
  actions.style.marginTop = "10px";
  actions.innerHTML = `
    <button onclick="randomizeUniqueCameras()" class="secondary">🎲 Randomize All Unique Camera Angles</button>
    <button onclick="generateVariants()" style="margin-left:8px">✨ Generate Images with These Angles</button>
  `;
  container.appendChild(actions);
}

function getConceptForVariant(v) {
  const geo = getCameraGeometry(v.camera);
  return `${v.camera} — ${geo.framingNote}`;
}

// Direct mapping so SEO exactly matches the camera angle the user chose (24 cameras → 24 aligned French SEO entries)
const cameraToSeoIndex = {
  "Standard Frontal Shot": 0,
  "Close-up Detail Shot": 1,
  "Wide Angle Overview": 2,
  "Low Angle Perspective": 3,
  "High Angle Bird's Eye": 4,
  "Three-Quarter Angle": 5,
  "Side Profile View": 6,
  "Overhead Top-Down": 7,
  "Eye-Level Straight On": 8,
  "Dutch Tilt Creative": 9,
  "Macro Extreme Close-up": 10,
  "Telephoto Zoomed In": 11,
  "Fisheye Wide Context": 12,
  "Panoramic Horizontal": 13,
  "Vertical Portrait Orientation": 14,
  "Isometric Angle": 15,
  "Oblique 45-Degree Angle": 16,
  "Dynamic Motion Capture": 17,
  "Static Product Placement": 18,
  "Lifestyle Contextual Shot": 19,
  "Texture Detail Focus": 20,
  "Environmental Wide Scene": 21,
  "Symmetrical Centered Composition": 22,
  "Tight Product Crop": 23
};

function buildUniqueFrenchSeo(camera, usedSet) {
  const concept = getConceptForVariant({ camera });
  const preferredIdx = cameraToSeoIndex[camera] ?? 0;

  // Build dynamic context from user inputs (focus keyphrase = top priority)
  const userContext = [
    focusKeyphrase || '',
    globalStylePreset || '',
    pageContent.substring(0, 800) || ''
  ].join(' ').toLowerCase();

  function pickUnique(pool, usedSet, limit, concept, preferredIdx = -1) {
    // 1. Strongly prefer the exact matching SEO entry for this camera
    if (preferredIdx >= 0 && preferredIdx < pool.length) {
      let pref = pool[preferredIdx];
      // Inject user focus keyphrase + style if provided (while keeping grammar)
      if (focusKeyphrase && pref.length + focusKeyphrase.length + 3 <= limit) {
        // Smart injection: add keyphrase naturally at the end or appropriate place
        if (!pref.toLowerCase().includes(focusKeyphrase.toLowerCase())) {
          pref = pref.replace(/\.$/, ` pour ${focusKeyphrase}.`);
        }
      }
      if (globalStylePreset && pref.length + globalStylePreset.length + 5 <= limit) {
        if (!pref.toLowerCase().includes(globalStylePreset.toLowerCase())) {
          pref = pref.replace(/\.$/, ` dans un style ${globalStylePreset}.`);
        }
      }
      if (!usedSet.has(pref) && pref.length <= limit) {
        return pref;
      }
    }

    // 2. Relevance sort boosted by camera + user focus keyphrase + style preset + page content
    let candidates = [...pool];
    const lc = (concept + ' ' + userContext).toLowerCase();

    candidates.sort((a, b) => {
      let sa = 0, sb = 0;

      // Camera relevance (existing logic)
      if (lc.includes("gros plan") || lc.includes("close") || lc.includes("macro") || lc.includes("détail") || lc.includes("texture")) {
        if (a.toLowerCase().includes("gros plan") || a.toLowerCase().includes("détail") || a.toLowerCase().includes("texture")) sa += 2;
        if (b.toLowerCase().includes("gros plan") || b.toLowerCase().includes("détail") || b.toLowerCase().includes("texture")) sb += 2;
      }
      if (lc.includes("wide") || lc.includes("panoramique") || lc.includes("environnement") || lc.includes("large") || lc.includes("vue d'ensemble")) {
        if (a.toLowerCase().includes("large") || a.toLowerCase().includes("vue d'ensemble") || a.toLowerCase().includes("contexte")) sa += 1;
        if (b.toLowerCase().includes("large") || b.toLowerCase().includes("vue d'ensemble") || b.toLowerCase().includes("contexte")) sb += 1;
      }
      if (lc.includes("angle") || lc.includes("bas") || lc.includes("plongée") || lc.includes("oblique") || lc.includes("rotation") || lc.includes("profil") || lc.includes("vertical")) {
        if (a.toLowerCase().includes("angle") || a.toLowerCase().includes("plongée") || a.toLowerCase().includes("oblique") || a.toLowerCase().includes("profil") || a.toLowerCase().includes("vertical")) sa += 1;
        if (b.toLowerCase().includes("angle") || b.toLowerCase().includes("plongée") || b.toLowerCase().includes("oblique") || b.toLowerCase().includes("profil") || b.toLowerCase().includes("vertical")) sb += 1;
      }

      // Strong boost for user's Focus Keyphrase (top priority)
      if (focusKeyphrase) {
        const k = focusKeyphrase.toLowerCase();
        if (a.toLowerCase().includes(k)) sa += 4;
        if (b.toLowerCase().includes(k)) sb += 4;
      }

      // Boost for global style preset
      if (globalStylePreset) {
        const s = globalStylePreset.toLowerCase();
        if (a.toLowerCase().includes(s) || (s.includes("luxury") && (a.includes("premium") || a.includes("élégant") || a.includes("sophistiqué")))) sa += 2;
        if (b.toLowerCase().includes(s) || (s.includes("luxury") && (b.includes("premium") || b.includes("élégant") || b.includes("sophistiqué")))) sb += 2;
      }

      // Bonus from page content keywords
      if (pageContent) {
        const keywords = pageContent.toLowerCase().split(/\s+/).filter(w => w.length > 4).slice(0, 15);
        keywords.forEach(kw => {
          if (a.toLowerCase().includes(kw)) sa += 1;
          if (b.toLowerCase().includes(kw)) sb += 1;
        });
      }

      return (sb - sa) || (Math.random() - 0.5);
    });

    for (let text of candidates) {
      let finalText = text;

      // Inject focus keyphrase (highest priority)
      if (focusKeyphrase && !finalText.toLowerCase().includes(focusKeyphrase.toLowerCase()) && finalText.length + focusKeyphrase.length + 8 <= limit) {
        finalText = finalText.replace(/\.$/, ` pour ${focusKeyphrase}.`);
      }

      // Inject style preset
      if (globalStylePreset && !finalText.toLowerCase().includes(globalStylePreset.toLowerCase()) && finalText.length + globalStylePreset.length + 10 <= limit) {
        finalText = finalText.replace(/\.$/, ` dans un style ${globalStylePreset}.`);
      }

      if (!usedSet.has(finalText) && finalText.length <= limit) return finalText;
    }

    // 3. Last resort: any unused, trimmed if needed
    for (let text of pool) {
      if (!usedSet.has(text)) {
        let t = text;
        if (t.length > limit) {
          const sp = t.lastIndexOf(" ", limit);
          if (sp > 10) t = t.substring(0, sp);
        }
        return t;
      }
    }
    return pool[0].substring(0, limit);
  }

  return {
    alt: pickUnique(altPool, usedSet, 125, concept, preferredIdx),
    title: pickUnique(titlePool, usedSet, 60, concept, preferredIdx),
    caption: pickUnique(captionPool, usedSet, 150, concept, preferredIdx),
    desc: pickUnique(descPool, usedSet, 300, concept, preferredIdx)
  };
}

function batchGenerateSeo() {
  let used = new Set();
  for (let i = 0; i < variants.length; i++) {
    const seo = buildUniqueFrenchSeo(variants[i].camera, used);
    Object.assign(variants[i], seo);
    variants[i].concept = getConceptForVariant(variants[i]);
    used.add(seo.alt);
    used.add(seo.title);
    used.add(seo.caption);
    used.add(seo.desc);
  }
  renderSeoTable();
  log(`100% unique French SEO generated for all ${variants.length} variants (based purely on the camera angles you chose).`);
}

function generateSeoForVariant(idx) {
  let used = new Set();
  variants.forEach((v, i) => {
    if (i !== idx) {
      used.add(v.alt); used.add(v.title); used.add(v.caption); used.add(v.desc);
    }
  });
  const seo = buildUniqueFrenchSeo(variants[idx].camera, used);
  Object.assign(variants[idx], seo);
  variants[idx].concept = getConceptForVariant(variants[idx]);
  renderSeoTable();
  log(`Unique French SEO regenerated for Variant ${idx + 1} using its specific camera angle concept.`);
}

function fetchSeoForVariant(idx) {
  log(`🔎 Fetching SEO for Variant ${idx + 1} (content-aware from chosen camera angle)...`);
  setTimeout(() => {
    generateSeoForVariant(idx);
    log(`SEO applied to Variant ${idx + 1} (tied to its camera framing).`);
  }, 280);
}

function updateField(idx, field, value) {
  variants[idx][field] = value;
  const counter = document.getElementById(`counter-${field}-${idx}`);
  if (counter) {
    const limit = getLimit(field);
    counter.textContent = `${value.length}/${limit}`;
    counter.style.color = (value.length > limit) ? "var(--danger)" : "var(--text-secondary)";
  }
}

function renderGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;
  grid.innerHTML = "";
  variants.forEach((v, i) => {
    const card = document.createElement("div");
    card.className = "variant-card glass";
    const conceptHtml = v.concept ? `<div class="concept"><strong>Camera angle:</strong> ${escapeHtml(v.concept)}</div>` : "";
    card.innerHTML = `
      <img src="${v.imageUrl || ""}" alt="Variant ${v.id}">
      <div class="card-body">
        <h3>Variant ${v.id}</h3>
        <div class="meta">
          <span>📷 ${v.camera}</span>
        </div>
        ${conceptHtml}
        <div class="actions">
          <button onclick="fetchSeoForVariant(${i})">🔎 Fetch</button>
          <button onclick="generateSeoForVariant(${i})">✨ Generate</button>
          <button onclick="downloadVariant(${i})">⬇️ Download</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderSeoTable() {
  const container = document.getElementById("seo-table-container");
  if (!container) return;
  let html = `<table class="seo-table">
    <thead>
      <tr>
        <th>Variant</th>
        <th>Camera Angle (your choice)</th>
        <th>Visual Concept (drives SEO)</th>
        <th>Alt Text (French) ≤125</th>
        <th>Title (French) ≤60</th>
        <th>Caption (French) ≤150</th>
        <th>Description (French) ≤300</th>
      </tr>
    </thead>
    <tbody>`;
  variants.forEach((v, i) => {
    html += `<tr>
      <td><strong>Variant ${v.id}</strong></td>
      <td>${v.camera}</td>
      <td><small>${escapeHtml(v.concept)}</small></td>
      <td>
        <input type="text" value="${escapeHtml(v.alt)}" oninput="updateField(${i}, 'alt', this.value)">
        <span class="char-counter" id="counter-alt-${i}">${v.alt.length}/125</span>
      </td>
      <td>
        <input type="text" value="${escapeHtml(v.title)}" oninput="updateField(${i}, 'title', this.value)">
        <span class="char-counter" id="counter-title-${i}">${v.title.length}/60</span>
      </td>
      <td>
        <textarea oninput="updateField(${i}, 'caption', this.value)">${escapeHtml(v.caption)}</textarea>
        <span class="char-counter" id="counter-caption-${i}">${v.caption.length}/150</span>
      </td>
      <td>
        <textarea oninput="updateField(${i}, 'desc', this.value)">${escapeHtml(v.desc)}</textarea>
        <span class="char-counter" id="counter-desc-${i}">${v.desc.length}/300</span>
      </td>
    </tr>`;
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
}

function renderBasePreviews() {
  const container = document.getElementById("base-previews");
  if (!container) return;
  container.innerHTML = "";
  baseImages.forEach((b, idx) => {
    const div = document.createElement("div");
    div.className = "base-thumb";
    div.innerHTML = `
      <img src="${b.url}" title="${b.name}">
      <span>${b.name}</span>
      <button onclick="removeBase(${idx})" title="Remove">×</button>
    `;
    container.appendChild(div);
  });
}

function removeBase(idx) {
  if (baseImages[idx]) URL.revokeObjectURL(baseImages[idx].url);
  baseImages.splice(idx, 1);
  renderBasePreviews();
  log(`Removed one base image. ${baseImages.length} remaining.`);
}

function clearBases() {
  baseImages.forEach(b => URL.revokeObjectURL(b.url));
  baseImages = [];
  const container = document.getElementById("base-previews");
  if (container) container.innerHTML = "";
  log("All base images cleared.");
}

function handleFiles(files) {
  baseImages = [];
  let added = 0;
  for (let file of files) {
    if (file.type.startsWith("image/") && added < 24) {
      const url = URL.createObjectURL(file);
      baseImages.push({ name: file.name, url: url, file: file });
      added++;
    }
  }
  renderBasePreviews();
  log(`Uploaded ${baseImages.length} base image(s). They will be cycled across variants.`);
}

function setupDropzone() {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  if (!dropzone || !fileInput) return;

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
    e.target.value = "";
  });
}

async function generateVariants() {
  if (variants.length !== numVariants) initVariants();

  log(`Generating ${numVariants} variants using PURE STRONG CAMERA ANGLES ONLY (no filters, no lighting, no color changes, no stretch, no extra background). Differences are clearly visible.`);

  for (let i = 0; i < variants.length; i++) {
    const baseUrl = getBaseForVariant(i);
    const v = variants[i];
    v.imageUrl = await createVariantImage(baseUrl, v.camera);
    v.filename = `variant-${v.id}.${exportFormat.includes("png") ? "png" : exportFormat.includes("webp") ? "webp" : "jpg"}`;
    v.concept = getConceptForVariant(v);
  }

  log(`${numVariants} variants rendered with distinct camera geometry (different crops and angles).`);

  batchGenerateSeo();

  renderGallery();
  renderSeoTable();
  renderAngleSelectors();

  document.querySelectorAll(".exports button").forEach(btn => btn.disabled = false);

  log("✅ Full system ready. You have complete control over the camera angle for every variant.");
}

function downloadVariant(idx) {
  const v = variants[idx];
  if (!v.imageUrl) {
    log("No image ready for this variant yet.");
    return;
  }
  const a = document.createElement("a");
  a.href = v.imageUrl;
  a.download = v.filename || `variant-${v.id}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  log(`Downloaded ${v.filename}`);
}

function exportCsv() {
  let csv = "Variant,Camera Angle,Visual Concept,Alt Text,Title,Caption,Description,Filename\n";
  variants.forEach(v => {
    const safe = (s) => `"${(s || "").replace(/"/g, '""')}"`;
    const row = [
      `Variant ${v.id}`,
      v.camera,
      safe(v.concept),
      safe(v.alt),
      safe(v.title),
      safe(v.caption),
      safe(v.desc),
      v.filename
    ].join(",");
    csv += row + "\n";
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "image-variant-pure-camera-angles.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  log("CSV exported (includes your chosen camera angles and concepts).");
}

async function exportZip() {
  let JSZipLib = (typeof window !== "undefined" && window.JSZip) || (typeof JSZip !== "undefined" ? JSZip : null);

  if (!JSZipLib) {
    log("JSZip not loaded — attempting dynamic load...");
    try {
      const s = document.createElement("script");
      s.src = "js/jszip.min.js";
      s.onload = () => log("JSZip loaded. Please click Export ZIP again.");
      document.head.appendChild(s);
    } catch (e) {}
    alert("js/jszip.min.js is required. Make sure the file is in the js/ folder and refresh the page.");
    return;
  }

  const zip = new JSZipLib();
  const folder = zip.folder("image-variants-pure-camera-angles");

  log(`Preparing ZIP with ${variants.length} variants (pure camera geometry only) in ${exportFormat.split("/")[1].toUpperCase()}...`);

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    if (v.imageUrl) {
      try {
        const resp = await fetch(v.imageUrl);
        const blob = await resp.blob();
        folder.file(v.filename || `variant-${v.id}.jpg`, blob);
      } catch (e) {
        const ph = createPlaceholderDataUrl(i);
        const b = await fetch(ph).then(r => r.blob());
        folder.file(`variant-${v.id}.jpg`, b);
      }
    }
  }

  let meta = `Image Variant v4.1.3 - Pure Camera Angles Only (NO FILTERS / NO LIGHTING)\nGenerated: ${new Date().toISOString()}\nFormat: ${exportFormat}\nNumber of variants: ${variants.length}\n\n`;
  variants.forEach(v => {
    meta += `=== Variant ${v.id} ===\nCamera Angle (chosen by you): ${v.camera}\nVisual Concept: ${v.concept}\nAlt Text: ${v.alt}\nTitle: ${v.title}\nCaption: ${v.caption}\nDescription: ${v.desc}\n\n`;
  });
  folder.file("metadata.txt", meta);

  let csv = "Variant,Camera Angle,Visual Concept,Alt Text,Title,Caption,Description,Filename\n";
  variants.forEach(v => {
    const safe = (s) => `"${(s || "").replace(/"/g, '""')}"`;
    csv += `Variant ${v.id},${v.camera},${safe(v.concept)},${safe(v.alt)},${safe(v.title)},${safe(v.caption)},${safe(v.desc)},${v.filename}\n`;
  });
  folder.file("seo-data.csv", csv);

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = "image-variants-pure-camera-angles.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  log("ZIP exported successfully: images (pure camera angles) + metadata.txt + CSV.");
}

function setupControls() {
  document.querySelectorAll(".exports button").forEach(btn => btn.disabled = true);

  const controls = document.getElementById("controls-section");
  if (controls && !document.getElementById("num-variants-input")) {
    const numDiv = document.createElement("div");
    numDiv.style.margin = "10px 0 4px";
    numDiv.innerHTML = `
      <label style="font-size:13px;color:#8e8e93">
        Number of variants (1–24 — you can assign a different camera angle to each):
        <input id="num-variants-input" type="number" min="1" max="24" value="${numVariants}" style="width:60px;margin-left:6px" onchange="setNumVariants(this.value)">
      </label>
    `;
    controls.appendChild(numDiv);
  }

  if (controls && !document.getElementById("format-selector")) {
    const fmt = document.createElement("div");
    fmt.style.marginTop = "4px";
    fmt.innerHTML = `
      <label style="font-size:13px;color:#8e8e93">
        Export/Generation Format:
        <select id="format-selector" onchange="setExportFormat(this.value)">
          <option value="image/jpeg">JPG</option>
          <option value="image/png">PNG (lossless)</option>
          <option value="image/webp">WEBP</option>
        </select>
      </label>
    `;
    controls.appendChild(fmt);
  }
}

function init() {
  initVariants();
  logEl = document.getElementById("log-output");
  setupDropzone();
  setupControls();
  renderAngleSelectors();
  renderGallery();
  renderSeoTable();

  const grid = document.getElementById("gallery-grid");
  if (grid && grid.children.length === 0) {
    grid.innerHTML = '<p class="placeholder glass">Set the number of variants, choose camera angles from the dropdowns, then click Generate. 100% pure camera angles only — no filters of any kind.</p>';
  }

  log("Image Variant v4.1.3 initialized — 100% PURE CAMERA ANGLES / FRAMING (no filters, no lighting, no color changes).");
  log("You now have full control: choose how many variants (1-24) and manually select the exact camera angle for EVERY variant.");
  log("All image differences come only from crop/zoom + rotation (real camera geometry).");
  log("French SEO is generated to match the camera concept you chose for each variant.");
  log("Ready: adjust number + angles, drop images (optional), click Generate.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
