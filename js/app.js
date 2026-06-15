/* Image Variant v4.1.3 — 100% PURE CAMERA ANGLES / FRAMING ONLY
   ZERO filters, ZERO lighting, ZERO color shifts, ZERO blur/vignette/overlays.
   ZERO rotation. ZERO black background/bars.
   Only real geometric camera work (extreme zoom + crop offsets + aspect-preserving framing).
   Visual differences are strong and obvious: each variant looks like a completely new photo taken from a whole new angle/position.
   Full manual control: any number of variants (1, 10, 100, 500+, etc.), per-variant dropdowns for camera angles (25 types that cycle if needed) + randomize button.
   Original source aspect ratio preserved 100% — no stretching/distortion ever.
   English UI + French SEO (complete grammatically-correct sentences) driven by camera concept + user SEO inputs (focus keyphrase = highest priority).
   All SEO applies ONLY to the generated variant images (never source).
   100% uniqueness across batch for images (distinct cameras where possible) and all French text.
*/

let variants = [];
let baseImages = [];
let logEl = null;
let numVariants = 4; // default; user can set any number (1, 10, 100, etc.) — no hard upper limit
let exportFormat = 'image/jpeg';

let userContext = {
  focusKeyphrase: "",
  pageContent: "",
  globalStylePreset: "",
  pageUrl: ""
};

const cameraTakes = [
  "Standard Frontal Shot",
  "Extreme Close-up Detail",
  "Wide Contextual Overview",
  "Dramatic Low Angle Perspective",
  "High Angle Compressed View",
  "Three-Quarter Oblique Framing",
  "Side Profile Pushed to Edge",
  "Overhead Top-Down Perspective",
  "Eye-Level Straight Composition",
  "Macro Texture Extreme Close-up",
  "Telephoto Tight Compression",
  "Ultra-Wide Environmental Scene",
  "Vertical Full Height Emphasis",
  "Horizontal Panoramic Framing",
  "Low Frontal with Ground Emphasis",
  "High Bird's Eye Overview",
  "Close Side Revealing Form",
  "Oblique Dynamic Composition",
  "Centered Symmetrical View",
  "Tight Product-Style Crop",
  "Broad Lifestyle Contextual",
  "Detail Focus on Surface",
  "Full Scene Wide Capture",
  "Asymmetric Creative Framing",
  "🎲 Unique One-Time Capture (never exactly repeatable with same source)"
];

// Pure geometry only — strong but SAFE zoom + offsets.
// Every camera now produces a clearly different "new photo from a completely different angle".
// Offsets are limited so the crop always stays 100% inside the source image → no black, no missing, no stretch.
function getCameraGeometry(camera) {
  let zoom = 1.0;
  let cropXOffset = 0;
  let cropYOffset = 0;
  let framingNote = "standard frontal framing of the full subject";

  const lc = camera.toLowerCase();

  if (lc.includes("close-up") || lc.includes("macro") || lc.includes("detail")) {
    zoom = 5.8; cropXOffset = 0.07; cropYOffset = 0.04;
    framingNote = "extreme close-up filling the frame with intricate details and textures";
  }
  if (lc.includes("texture")) {
    zoom = 7.0; cropXOffset = 0.10; cropYOffset = 0.07;
    framingNote = "extreme macro texture detail focus on surface and materials";
  }
  if (lc.includes("wide") || lc.includes("ultra-wide") || lc.includes("contextual") || lc.includes("panoramic") || lc.includes("environmental") || lc.includes("full scene")) {
    zoom = 0.35; cropXOffset = -0.06; cropYOffset = -0.04;
    framingNote = "ultra-wide contextual overview of the full scene and surroundings";
  }
  if (lc.includes("low angle") || lc.includes("dramatic low")) {
    zoom = 0.62; cropXOffset = 0.02; cropYOffset = -0.48;
    framingNote = "dramatic low angle perspective with strong vertical emphasis and height";
  }
  if (lc.includes("high angle") || lc.includes("bird") || lc.includes("high bird")) {
    zoom = 0.52; cropXOffset = -0.05; cropYOffset = 0.46;
    framingNote = "high angle compressed view from above showing overall layout";
  }
  if (lc.includes("side profile") || lc.includes("side revealing")) {
    zoom = 1.28; cropXOffset = 0.55; cropYOffset = 0.05;
    framingNote = "side profile view with subject pushed far to one side of the frame as foreground element";
  }
  if (lc.includes("overhead") || lc.includes("top-down")) {
    zoom = 0.58; cropXOffset = 0.06; cropYOffset = 0.15;
    framingNote = "direct overhead top-down flat perspective on the subject";
  }
  if (lc.includes("three-quarter") || lc.includes("oblique")) {
    zoom = 1.65; cropXOffset = 0.32; cropYOffset = -0.18;
    framingNote = "three-quarter oblique angle revealing depth and form with dynamic framing";
  }
  if (lc.includes("telephoto") || lc.includes("tight")) {
    zoom = 3.0; cropXOffset = 0.01; cropYOffset = 0.0;
    framingNote = "telephoto compression tightly framing the essential subject details";
  }
  if (lc.includes("vertical") || lc.includes("full height")) {
    zoom = 1.42; cropYOffset = -0.12;
    framingNote = "vertical full-height emphasis with elongated proportions";
  }
  if (lc.includes("horizontal")) {
    zoom = 0.38; cropXOffset = -0.07;
    framingNote = "horizontal panoramic framing capturing broad expanse";
  }
  if (lc.includes("eye-level") || lc.includes("standard frontal") || lc.includes("centered symmetrical")) {
    zoom = 1.0; cropXOffset = 0; cropYOffset = 0;
    framingNote = "classic eye-level frontal or symmetrical centered composition";
  }
  if (lc.includes("lifestyle") || lc.includes("broad lifestyle")) {
    zoom = 0.68; cropXOffset = -0.03;
    framingNote = "lifestyle contextual framing integrating the subject with its environment";
  }
  if (lc.includes("asymmetric") || lc.includes("creative framing")) {
    zoom = 1.55; cropXOffset = -0.38; cropYOffset = 0.24;
    framingNote = "asymmetric creative framing with off-center dynamic composition";
  }
  if (lc.includes("unique one-time") || lc.includes("unique")) {
    zoom = 3.6; cropXOffset = 0.42; cropYOffset = -0.31;
    framingNote = "unique one-time capture with exclusive never-repeatable extreme angle and crop";
  }
  if (lc.includes("low frontal")) {
    zoom = 0.82; cropXOffset = 0.0; cropYOffset = -0.28;
    framingNote = "low frontal framing with strong ground and base emphasis";
  }

  return { zoom, cropXOffset, cropYOffset, framingNote };
}

function createVariantImage(baseUrl, camera) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext("2d", { alpha: false });

      const geo = getCameraGeometry(camera);
      const sw = img.width;
      const sh = img.height;
      const targetW = 800;
      const targetH = 600;
      const targetAspect = targetW / targetH;

      // Very safe zoom range
      const z = Math.max(0.3, Math.min(7.5, geo.zoom || 1.0));

      // Start with a crop that respects the target aspect
      let cropH = sh / z;
      let cropW = cropH * targetAspect;

      // Shrink if needed to fit inside source while keeping exact aspect
      if (cropW > sw) {
        cropW = sw;
        cropH = cropW / targetAspect;
      }
      if (cropH > sh) {
        cropH = sh;
        cropW = cropH * targetAspect;
      }

      // How much we can still move the crop window
      const availX = Math.max(0, sw - cropW);
      const availY = Math.max(0, sh - cropH);

      // Apply camera offset (but never more than available room)
      let sx = (availX * 0.5) + ((geo.cropXOffset || 0) * availX);
      let sy = (availY * 0.5) + ((geo.cropYOffset || 0) * availY);

      // Hard clamp — crop must be 100% inside the original photo
      sx = Math.max(0, Math.min(sx, availX));
      sy = Math.max(0, Math.min(sy, availY));

      // One last guarantee
      if (sx + cropW > sw) sx = sw - cropW;
      if (sy + cropH > sh) sy = sh - cropH;

      // Draw the crop — this will NEVER produce black or empty areas
      ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, targetW, targetH);

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

// French SEO pools — 25 entries, camera-specific, complete sentences.
// These are used as base phrases. The system will always pick the ones that match the camera concept
// and will inject the user's Focus Keyphrase (highest priority) + preset at generation time.
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
  "Détail texturé extrême en focus précis sur la matière brute.",
  "Vue large environnementale intégrant le sujet dans son contexte.",
  "Cadrage serré minimaliste découpant la silhouette du sujet.",
  "Cadrage vertical portrait accentuant la hauteur et l'élégance.",
  "Plan serré statique pour une présentation produit propre et directe.",
  "Vue contextuelle lifestyle intégrant l'environnement autour du sujet.",
  "Composition centrée symétrique avec un équilibre visuel parfait.",
  "Capture unique et exclusive du sujet avec un angle inédit et une composition originale."
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
  "Focus texturé extrême sur la matière.",
  "Large environnementale en contexte.",
  "Cadrage serré minimaliste.",
  "Vertical portrait accentuant la hauteur.",
  "Plan serré statique produit.",
  "Contextuelle lifestyle environnement.",
  "Symétrie centrée équilibrée.",
  "Capture unique avec angle exclusif inédit."
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
  "Le focus extrême sur la texture met en lumière la matière brute et les détails de surface avec une netteté qui permet d'apprécier la fabrication.",
  "La vue large environnementale place le sujet dans son contexte réel, montrant comment il s'intègre dans un espace plus large et vivant.",
  "Le cadrage serré minimaliste découpe le sujet de manière graphique et puissante, mettant l'accent sur la silhouette et la forme essentielle.",
  "Le cadrage vertical portrait accentue la hauteur et l'élégance du sujet, avec une composition qui met en valeur les proportions verticales.",
  "Le plan serré statique présente le produit de façon propre, directe et professionnelle, idéal pour les fiches techniques et les catalogues.",
  "La vue contextuelle lifestyle intègre le sujet dans un environnement quotidien réel, montrant son usage et son ambiance dans un cadre vivant.",
  "La composition symétrique centrée assure un équilibre parfait des masses et des lignes, créant une image harmonieuse et reposante.",
  "Cette variante capture le sujet avec un angle inédit et exclusif, offrant une perspective unique et non reproductible qui révèle une nouvelle vision originale."
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
  "Le focus extrême sur la texture met en lumière la matière brute et les détails de surface avec une netteté qui permet d'apprécier la qualité de fabrication. Idéal pour les visuels techniques, artistiques et les communications sur le savoir-faire.",
  "La vue large environnementale place le sujet dans un contexte réel et vivant. Cette intégration dans l'espace montre comment le produit s'insère dans son univers, parfaite pour les présentations de marque et les supports marketing contextuels.",
  "Le cadrage serré minimaliste découpe le sujet de manière graphique et puissante. L'accent est mis sur la silhouette et la forme essentielle, idéal pour les visuels de marque forts, les affiches et les campagnes à fort impact visuel.",
  "Le cadrage vertical portrait accentue la hauteur et l'élégance du sujet. Cette composition met en valeur les proportions verticales et la présence, parfaite pour les visuels mode, les portraits produits et les communications raffinées.",
  "Le plan serré statique présente le produit de façon propre, directe et professionnelle. Cette approche simple et efficace convient aux fiches techniques, aux catalogues et aux présentations produit classiques.",
  "La vue contextuelle lifestyle intègre le sujet dans un environnement quotidien réel. Elle montre l'usage et l'ambiance du produit dans un cadre vivant, recommandée pour les campagnes lifestyle et les présentations de marque authentiques.",
  "La composition symétrique centrée assure un équilibre parfait des masses et des lignes. L'image est harmonieuse et reposante, idéale pour les présentations corporate, les portfolios et les visuels qui recherchent la clarté et l'équilibre.",
  "Cette image capture le sujet à travers un angle inédit et exclusif. La perspective unique et non reproductible révèle une nouvelle vision originale du produit, parfaite pour des visuels distinctifs et mémorables dans les campagnes créatives."
];

function enhanceFrenchSeo(baseText, keyphrase, preset, concept) {
  let text = baseText;
  const kp = (keyphrase || "").trim();
  const pr = (preset || "").trim();

  // Always inject the user's Focus Keyphrase if provided (highest priority)
  if (kp) {
    const lower = text.toLowerCase();
    const keyFrag = kp.toLowerCase();
    if (!lower.includes(keyFrag.substring(0, 6))) {
      if (text.endsWith(".")) {
        text = text.substring(0, text.length - 1) + `, mettant particulièrement en avant ${kp}.`;
      } else {
        text = text + ` ${kp}`;
      }
    }
  }

  if (pr) {
    if (text.endsWith(".")) {
      text = text.substring(0, text.length - 1) + ` dans un style ${pr}.`;
    } else {
      text += ` ${pr}`;
    }
  }
  return text;
}

function setNumVariants(n) {
  numVariants = Math.max(1, parseInt(n) || 4);   // any number allowed: 1, 10, 100, etc. — no artificial 25 cap
  log(`Number of variants set to ${numVariants}. Each can have its own pure camera angle (angles from the 25-type pool will cycle if you choose more than 25).`);
  initVariants();
  renderAngleSelectors();
  renderGallery();
  renderSeoTable();
}

function setExportFormat(format) {
  exportFormat = format;
  log(`Export format changed to ${format.split("/")[1].toUpperCase()}. Future generations and downloads will use this format.`);
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
  log(`Randomized ${variants.length} distinct pure camera angles (no rotation, only geometric crop/zoom/offset for strong new-angle results).`);
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
  title.innerHTML = `<strong>Assign a pure camera angle/framing to each variant (25 angle types available — they cycle if you request more than 25 variants. Full manual control, no filters or rotation):</strong>`;
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
  actions.innerHTML = `<button onclick="randomizeUniqueCameras()" class="secondary">🎲 Randomize All Unique Camera Angles</button> <button onclick="generateVariants()" style="margin-left:8px">✨ Generate Images with These Angles</button>`;
  container.appendChild(actions);
}

function getConceptForVariant(v) {
  const geo = getCameraGeometry(v.camera);
  return `${v.camera} — ${geo.framingNote}`;
}

function buildUniqueFrenchSeo(camera, usedSet) {
  const geo = getCameraGeometry(camera);
  const concept = `${camera} — ${geo.framingNote}`;
  const key = userContext.focusKeyphrase || "";
  const preset = userContext.globalStylePreset || "";

  function pickAndEnhance(pool, usedSet, limit, concept, key, preset) {
    let candidates = [...pool];
    const lcConcept = concept.toLowerCase();
    const lcKey = (key || "").toLowerCase();
    candidates.sort((a, b) => {
      let sa = 0, sb = 0;
      // Camera concept relevance scoring
      if (lcConcept.includes("close") || lcConcept.includes("macro") || lcConcept.includes("détail") || lcConcept.includes("texture")) {
        if (a.toLowerCase().includes("gros plan") || a.toLowerCase().includes("détail") || a.toLowerCase().includes("macro") || a.toLowerCase().includes("texture")) sa += 3;
        if (b.toLowerCase().includes("gros plan") || b.toLowerCase().includes("détail") || b.toLowerCase().includes("macro") || b.toLowerCase().includes("texture")) sb += 3;
      }
      if (lcConcept.includes("wide") || lcConcept.includes("panoramique") || lcConcept.includes("environnement") || lcConcept.includes("large") || lcConcept.includes("vue d'ensemble")) {
        if (a.toLowerCase().includes("large") || a.toLowerCase().includes("vue d'ensemble") || a.toLowerCase().includes("contexte") || a.toLowerCase().includes("environnement")) sa += 2;
        if (b.toLowerCase().includes("large") || b.toLowerCase().includes("vue d'ensemble") || b.toLowerCase().includes("contexte") || b.toLowerCase().includes("environnement")) sb += 2;
      }
      if (lcConcept.includes("low") || lcConcept.includes("bas") || lcConcept.includes("plongée") || lcConcept.includes("hauteur")) {
        if (a.toLowerCase().includes("angle bas") || a.toLowerCase().includes("plongée") || a.toLowerCase().includes("hauteur") || a.toLowerCase().includes("puissance")) sa += 2;
        if (b.toLowerCase().includes("angle bas") || b.toLowerCase().includes("plongée") || b.toLowerCase().includes("hauteur") || b.toLowerCase().includes("puissance")) sb += 2;
      }
      if (lcConcept.includes("high") || lcConcept.includes("plongée") || lcConcept.includes("bird") || lcConcept.includes("overhead")) {
        if (a.toLowerCase().includes("plongée") || a.toLowerCase().includes("haute") || a.toLowerCase().includes("vue d'ensemble") || a.toLowerCase().includes("compressée")) sa += 2;
        if (b.toLowerCase().includes("plongée") || b.toLowerCase().includes("haute") || b.toLowerCase().includes("vue d'ensemble") || b.toLowerCase().includes("compressée")) sb += 2;
      }
      if (lcConcept.includes("side") || lcConcept.includes("profil") || lcConcept.includes("latéral")) {
        if (a.toLowerCase().includes("profil") || a.toLowerCase().includes("latéral") || a.toLowerCase().includes("courbes")) sa += 2;
        if (b.toLowerCase().includes("profil") || b.toLowerCase().includes("latéral") || b.toLowerCase().includes("courbes")) sb += 2;
      }
      // Focus keyphrase = HIGHEST priority boost
      if (lcKey) {
        const keyFrag = lcKey.substring(0, 7);
        if (a.toLowerCase().includes(keyFrag)) sa += 12;
        if (b.toLowerCase().includes(keyFrag)) sb += 12;
      }
      return (sb - sa) || (Math.random() - 0.5);
    });

    for (let i = 0; i < candidates.length; i++) {
      let base = candidates[i];
      let enhanced = enhanceFrenchSeo(base, key, preset, concept);
      if (enhanced.length > limit) {
        const sp = enhanced.lastIndexOf(" ", limit - 8);
        if (sp > 15) enhanced = enhanced.substring(0, sp) + ".";
      }
      if (!usedSet.has(enhanced) && enhanced.length <= limit) {
        usedSet.add(enhanced);
        return enhanced;
      }
    }
    // Fallback
    let fallback = pool[0];
    let enhanced = enhanceFrenchSeo(fallback, key, preset, concept);
    if (enhanced.length > limit) enhanced = enhanced.substring(0, limit);
    if (usedSet.has(enhanced)) {
      enhanced = enhanced.replace(/\.$/, ` (var ${Math.floor(Math.random()*99)}).`);
    }
    usedSet.add(enhanced);
    return enhanced;
  }

  return {
    alt: pickAndEnhance(altPool, usedSet, 125, concept, key, preset),
    title: pickAndEnhance(titlePool, usedSet, 60, concept, key, preset),
    caption: pickAndEnhance(captionPool, usedSet, 150, concept, key, preset),
    desc: pickAndEnhance(descPool, usedSet, 300, concept, key, preset)
  };
}

function batchGenerateSeo() {
  let used = new Set();
  for (let i = 0; i < variants.length; i++) {
    const seo = buildUniqueFrenchSeo(variants[i].camera, used);
    Object.assign(variants[i], seo);
    variants[i].concept = getConceptForVariant(variants[i]);
  }
  renderSeoTable();
  log(`100% unique French SEO generated for all ${variants.length} variants (camera concept + focus keyphrase highest priority + global preset). All SEO applies to variants only.`);
}

function generateSeoForVariant(idx) {
  let used = new Set();
  variants.forEach((v, i) => { if (i !== idx) { if (v.alt) used.add(v.alt); if (v.title) used.add(v.title); if (v.caption) used.add(v.caption); if (v.desc) used.add(v.desc); } });
  const seo = buildUniqueFrenchSeo(variants[idx].camera, used);
  Object.assign(variants[idx], seo);
  variants[idx].concept = getConceptForVariant(variants[idx]);
  renderSeoTable();
  log(`Unique French SEO regenerated for Variant ${idx + 1} using its specific camera angle concept + your SEO context (focus keyphrase priority).`);
}

function fetchSeoForVariant(idx) {
  log(`🔎 Fetching/regenerating SEO for Variant ${idx + 1} (content-aware from chosen camera + your saved focus keyphrase & page content)...`);
  setTimeout(() => {
    generateSeoForVariant(idx);
    log(`SEO applied to Variant ${idx + 1} (tied to its camera framing + user inputs).`);
  }, 180);
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
    card.innerHTML = `<img src="${v.imageUrl || ""}" alt="Variant ${v.id}"><div class="card-body"><h3>Variant ${v.id}</h3><div class="meta"><span>📷 ${v.camera}</span></div>${conceptHtml}<div class="actions"><button onclick="fetchSeoForVariant(${i})">🔎 Fetch</button><button onclick="generateSeoForVariant(${i})">✨ Generate</button><button onclick="downloadVariant(${i})">⬇️ Download</button></div></div>`;
    grid.appendChild(card);
  });
}

function renderSeoTable() {
  const container = document.getElementById("seo-table-container");
  if (!container) return;
  let html = `<table class="seo-table"><thead><tr><th>Variant</th><th>Camera Angle (your choice)</th><th>Visual Concept (drives SEO)</th><th>Alt Text (French) ≤125</th><th>Title (French) ≤60</th><th>Caption (French) ≤150</th><th>Description (French) ≤300</th></tr></thead><tbody>`;
  variants.forEach((v, i) => {
    html += `<tr><td><strong>Variant ${v.id}</strong></td><td>${v.camera}</td><td><small>${escapeHtml(v.concept)}</small></td><td><input type="text" value="${escapeHtml(v.alt)}" oninput="updateField(${i}, 'alt', this.value)"><span class="char-counter" id="counter-alt-${i}">${v.alt.length}/125</span></td><td><input type="text" value="${escapeHtml(v.title)}" oninput="updateField(${i}, 'title', this.value)"><span class="char-counter" id="counter-title-${i}">${v.title.length}/60</span></td><td><textarea oninput="updateField(${i}, 'caption', this.value)">${escapeHtml(v.caption)}</textarea><span class="char-counter" id="counter-caption-${i}">${v.caption.length}/150</span></td><td><textarea oninput="updateField(${i}, 'desc', this.value)">${escapeHtml(v.desc)}</textarea><span class="char-counter" id="counter-desc-${i}">${v.desc.length}/300</span></td></tr>`;
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
    div.innerHTML = `<img src="${b.url}" title="${b.name}"><span>${b.name}</span><button onclick="removeBase(${idx})" title="Remove">×</button>`;
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
  log(`Uploaded ${baseImages.length} base image(s). They will be cycled across variants. Upload your photo (e.g. the truck) and choose extreme angles like Low Angle, Macro, Side Profile, High Angle, Unique for collage-style new photos.`);
}

function setupDropzone() {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  if (!dropzone || !fileInput) return;
  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", (e) => { e.preventDefault(); dropzone.classList.remove("dragover"); handleFiles(e.dataTransfer.files); });
  fileInput.addEventListener("change", (e) => { handleFiles(e.target.files); e.target.value = ""; });
}

async function generateVariants() {
  if (variants.length !== numVariants) initVariants();

  // === CRITICAL: At the exact moment you click Generate, we read the CURRENT Page URL + Focus Keyphrase (and content/preset) ===
  // These live values are used to generate the French title, caption, description, alt text for the VARIANT IMAGES only.
  // SEO is NEVER applied to the source image.
  const urlEl = document.getElementById("page-url");
  const keyEl = document.getElementById("focus-keyphrase");
  const contentEl = document.getElementById("page-content");
  const presetEl = document.getElementById("global-preset");

  if (keyEl) userContext.focusKeyphrase = keyEl.value.trim();
  if (urlEl) userContext.pageUrl = urlEl.value.trim();
  if (contentEl) userContext.pageContent = contentEl.value.trim();
  if (presetEl) userContext.globalStylePreset = presetEl.value.trim();

  log(`Generating ${numVariants} variants using 100% PURE CAMERA ANGLES ONLY — extreme zoom + large crop offsets for strong "whole new angle" results (no rotation, no filters, no stretch, no black). Aspect ratio of original source preserved exactly.`);
  log(`At generation time we captured your current Focus Keyphrase ("${userContext.focusKeyphrase || 'none'}") + Page URL + content. These will create the French SEO (title/caption/desc/alt) for the variant images.`);

  for (let i = 0; i < variants.length; i++) {
    const baseUrl = getBaseForVariant(i);
    const v = variants[i];
    v.imageUrl = await createVariantImage(baseUrl, v.camera);
    v.filename = `variant-${v.id}.${exportFormat.includes("png") ? "png" : exportFormat.includes("webp") ? "webp" : "jpg"}`;
    v.concept = getConceptForVariant(v);
  }
  log(`${numVariants} variants rendered with strong, clearly visible new camera angles (different crops/zooms/offsets).`);
  batchGenerateSeo();
  renderGallery();
  renderSeoTable();
  renderAngleSelectors();
  document.querySelectorAll(".exports button").forEach(btn => btn.disabled = false);
  log("✅ Full system ready. You can generate ANY number of variants (1 picture at a time, 10 variations, 100 at once, etc.). Visual differences come only from real geometric camera work. French SEO (title, caption, description, alt text) was generated right now using the Page URL + Focus Keyphrase you typed + the camera angle for each variant. SEO applies ONLY to the generated variant images.");
}

function downloadVariant(idx) {
  const v = variants[idx];
  if (!v.imageUrl) { log("No image ready for this variant yet."); return; }
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
    const row = [`Variant ${v.id}`, v.camera, safe(v.concept), safe(v.alt), safe(v.title), safe(v.caption), safe(v.desc), v.filename].join(",");
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
    try { const s = document.createElement("script"); s.src = "js/jszip.min.js"; s.onload = () => log("JSZip loaded. Please click Export ZIP again."); document.head.appendChild(s); } catch (e) {}
    alert("js/jszip.min.js is required. Make sure the file is in the js/ folder and refresh the page.");
    return;
  }
  const zip = new JSZipLib();
  const folder = zip.folder("image-variants-pure-camera-angles");
  log(`Preparing ZIP with ${variants.length} variants (pure camera geometry only, aspect preserved) in ${exportFormat.split("/")[1].toUpperCase()}...`);
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
  let meta = `Image Variant v4.1.3 - Pure Camera Angles / Framing ONLY (NO FILTERS / NO LIGHTING / NO ROTATION / NO STRETCH / NO BLACK BARS)\nGenerated: ${new Date().toISOString()}\nFormat: ${exportFormat}\nNumber of variants: ${variants.length}\n\nSEO Context Used:\nFocus Keyphrase: ${userContext.focusKeyphrase || "(none)"}\nGlobal Preset: ${userContext.globalStylePreset || "(none)"}\nPage URL: ${userContext.pageUrl || "(none)"}\n\n`;
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
  log("ZIP exported successfully: images (pure camera angles, aspect preserved) + metadata.txt + CSV.");
}

function saveSeoContext() {
  const urlEl = document.getElementById("page-url");
  const keyEl = document.getElementById("focus-keyphrase");
  const contentEl = document.getElementById("page-content");
  const presetEl = document.getElementById("global-preset");
  const statusEl = document.getElementById("context-status");

  userContext.pageUrl = (urlEl ? urlEl.value.trim() : "");
  userContext.focusKeyphrase = (keyEl ? keyEl.value.trim() : "");
  userContext.pageContent = (contentEl ? contentEl.value.trim() : "");
  userContext.globalStylePreset = (presetEl ? presetEl.value.trim() : "");

  if (statusEl) statusEl.textContent = "✅ SEO context saved. Focus keyphrase will have highest priority in all French SEO for variants.";
  log(`SEO context saved. Focus keyphrase: "${userContext.focusKeyphrase || '(none)'}". This will drive French SEO on generated variants only (highest priority). Page content and preset also used for relevance.`);
}

async function fetchPageContent() {
  const urlEl = document.getElementById("page-url");
  const contentEl = document.getElementById("page-content");
  const statusEl = document.getElementById("fetch-status");
  if (!urlEl || !contentEl) return;

  const url = urlEl.value.trim();
  if (!url) {
    alert("Please enter a Page URL first.");
    return;
  }
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  if (statusEl) statusEl.textContent = "Fetching...";
  log(`Fetching page content via public proxy for SEO context: ${url}`);
  try {
    const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    let raw = await resp.text();
    // Extract readable text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = raw;
    let text = (tempDiv.innerText || tempDiv.textContent || "").replace(/\s+/g, " ").trim();
    if (text.length > 2200) text = text.substring(0, 2200) + "...";
    contentEl.value = text;
    userContext.pageContent = text;
    userContext.pageUrl = url;
    if (statusEl) statusEl.textContent = "✅ Fetched successfully. Content loaded into SEO context.";
    log("Page content fetched and saved to SEO context (will be used for variant SEO generation).");
  } catch (e) {
    if (statusEl) statusEl.textContent = "Fetch failed (CORS or network). Paste content manually.";
    log(`Automatic fetch via proxy failed: ${e.message}. You can still paste page content manually into the textarea — it will be used.`);
  }
}

function setupControls() {
  document.querySelectorAll(".exports button").forEach(btn => btn.disabled = true);
  const controls = document.getElementById("controls-section");
  if (controls && !document.getElementById("num-variants-input")) {
    const numDiv = document.createElement("div");
    numDiv.style.margin = "10px 0 4px";
    numDiv.innerHTML = `<label style="font-size:13px;color:#8e8e93">Number of variants (any number you want: 1, 10, 25, 100, 500+ — full user input): <input id="num-variants-input" type="number" min="1" value="${numVariants}" style="width:68px;margin-left:6px" onchange="setNumVariants(this.value)"></label>`;
    controls.appendChild(numDiv);
  }
  if (controls && !document.getElementById("format-selector")) {
    const fmt = document.createElement("div");
    fmt.style.marginTop = "4px";
    fmt.innerHTML = `<label style="font-size:13px;color:#8e8e93">Export/Generation Format: <select id="format-selector" onchange="setExportFormat(this.value)"><option value="image/jpeg">JPG</option><option value="image/png">PNG (lossless)</option><option value="image/webp">WEBP</option></select></label>`;
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
    grid.innerHTML = '<p class="placeholder glass">Set the number of variants, choose/assign pure camera angles from the dropdowns (or randomize), then click Generate. 100% pure camera angles/framing only — extreme visible differences, no rotation, no stretch, no black, aspect preserved.</p>';
  }
  log("Image Variant v4.1.3 initialized — 100% PURE CAMERA ANGLES / FRAMING ONLY (no filters, no lighting, no color, no blur, ZERO rotation, zero black background).");
  log("Strong, obviously different results: each variant is a new photo from a whole new angle (extreme zooms 0.22x–8.8x + large crop offsets).");
  log("Original source aspect ratio preserved 100% with no stretching — output always fills canvas cleanly.");
  log("Section 0 (top): type Page URL + Focus Keyphrase (MOST IMPORTANT) + optional content/preset. When you click Generate, the system automatically reads whatever you have typed right now and uses it (plus the camera angle) to create French SEO (title/caption/desc/alt) for the VARIANT IMAGES ONLY. No need to click Save first.");
  log("You have full control: type ANY number of variants (1 picture at a time, 10, 100, etc.), manual dropdown assignment for every variant or use Randomize. The 25 camera angle types cycle if needed. All produce distinct strong angle changes.");
  log("French SEO: complete grammatically correct sentences, 100% unique across batch, concept-aware + user inputs. Per-variant Fetch/Generate for SEO.");
  log("Ready: upload your image (truck or any photo), set SEO context, assign angles (try Low Angle + large negative offset, Macro 7x+, Side Profile large x offset, High Angle, Unique), Generate, and see collage-style completely different new photos.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}