For Phase III - Part 3 - Subpart b - Languages 

I want u to make this app supported by all official Indian Languages - execption in report pdf section - dont translate the pdf part, since that document will be required on court which can be central or state so its better to keep the prd content English
all other things in full translation, and it should make sense


The 5 phases cover the entire architectural pipeline:

    Sourcing the assets (Noto Sans .woff2 files)

    Lazy-loading them conditionally to keep your Tauri bundle size small

    Handling the i18n logic (including RTL layout flipping for Urdu)

    Fixing CSS line-height issues peculiar to Indian fonts

    Passing that state safely down to the Rust layer over the IPC bus


Implementing all 22 official Scheduled Languages of India inside a Tauri application requires an architectural design that ensures zero font rendering failures (no "tofu" blank boxes) while keeping your application's binary size exceptionally low.Bundling every single Indian font naively will swell your installer binary by over 40MB. Instead, we will construct a pipeline that dynamically loads the required regional font only when the user switches to that specific language.The Master Architecture PlanPlaintext               ┌───────────────────────────────┐
               │    User Switched Language     │
               └───────────────┬───────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────┐             ┌───────────────────────┐
│ Dynamic Font Loader   │             │   i18next Engine      │
│ (Injects Font Face)   │             │ (Swaps JSON Locale)   │
└───────────┬───────────┘             └───────────┬───────────┘
            │                                     │
            └──────────────────┬──────────────────┘
                               ▼
               ┌───────────────────────────────┐
               │  Tauri IPC Core Command       │
               │ (Syncs Active Locale to Rust) │
               └───────────────────────────────┘
Critical Operational Verification ChecklistTechnical Focus AreaSpecific RequirementFailure MitigationVowel Layout ClippingDo not restrict line-height or use fixed heights on UI text fields (h-8, max-h-12).Complex conjunct markers in Kannada, Telugu, and Devanagari will visually stack and smash into boundaries.Asset ResolutionEnsure the Vite configuration allows bundling of raw .woff2 files inside assets.Add assetsInclude: ['**/*.woff2'] into your vite.config.ts if assets fail compilation.Urdu Layout InversionAlways map structural elements through standard CSS logical spacing components (margin-inline-start, padding-inline-end).Prevents absolute spacing rules from throwing text structures out of line when swapping to RTL mode.1.Asset Acquisition (Fonts & Locales):Phase 1.To ensure flawless rendering without OS dependencies, download the specialized open-source variable fonts from the Google Fonts GitHub Repository or the official Google Fonts portal.1. Download Font AssetsDownload the .woff2 (web open font format v2) variants for maximum compression:Devanagari Script (Hindi, Marathi, Sanskrit, Konkani, Nepali, Bodo, Dogri, Maithili): Download Noto Sans DevanagariBengali Script (Bengali, Assamese, Manipuri): Download Noto Sans BengaliGurmukhi Script (Punjabi): Download Noto Sans GurmukhiGujarati Script (Gujarati): Download Noto Sans GujaratiOdia Script (Odia): Download Noto Sans OdiaTamil Script (Tamil): Download Noto Sans TamilTelugu Script (Telugu): Download Noto Sans TeluguKannada Script (Kannada): Download Noto Sans KannadaMalayalam Script (Malayalam): Download Noto Sans MalayalamPerso-Arabic/Nastaliq (Urdu, Kashmiri, Sindhi): Download Noto Nastaliq UrduOl Chiki Script (Santali): Download Noto Sans Ol Chiki2. Set Up the Project Directory StructureOrganize your Tauri frontend structure (src/ directory) exactly like this:Plaintext    src/
    ├── assets/
    │   └── fonts/
    │       ├── NotoSans-Devanagari.woff2
    │       ├── NotoSans-Bengali.woff2
    │       └── ... (Drop all downloaded woff2 files here)
    ├── locales/
    │   ├── en.json
    │   ├── hi.json
    │   ├── te.json
    │   └── ... (All 22 language code JSON files)
    ├── utils/
    │   └── fontLoader.ts
    ├── i18n.ts
    ├── main.tsx
    └── App.tsx
    ```
  

  
    Loading all fonts simultaneously slows down application boot times. Create an automation script to handle lazy loading of fonts via the CSS Font Loading API.

    Create `src/utils/fontLoader.ts`:
    
typescript// Map BCP-47 language tags to their corresponding script fontsconst fontMapping: Record<string, { name: string; url: string }> = {hi: { name: 'Noto Sans Devanagari', url: '/src/assets/fonts/NotoSans-Devanagari.woff2' },mr: { name: 'Noto Sans Devanagari', url: '/src/assets/fonts/NotoSans-Devanagari.woff2' },bn: { name: 'Noto Sans Bengali', url: '/src/assets/fonts/NotoSans-Bengali.woff2' },te: { name: 'Noto Sans Telugu', url: '/src/assets/fonts/NotoSans-Telugu.woff2' },ta: { name: 'Noto Sans Tamil', url: '/src/assets/fonts/NotoSans-Tamil.woff2' },ur: { name: 'Noto Nastaliq Urdu', url: '/src/assets/fonts/NotoNastaliqUrdu.woff2' },// Map remaining languages to their designated font asset...};const loadedFonts = new Set();

pub async function loadRegionalFont(locale: string): Promise {
  const fontMeta = fontMapping[locale];
  if (!fontMeta) return 'Inter, sans-serif'; // Default UI font fallback

  if (loadedFonts.has(fontMeta.name)) {
    return fontMeta.name;
  }

  try {
    const fontFace = new FontFace(fontMeta.name, `url(${fontMeta.url})`, {
      style: 'normal',
      weight: '400 700'
    });

    const loadedFace = await fontFace.load();
    document.fonts.add(loadedFace);
    loadedFonts.add(fontMeta.name);
    return fontMeta.name;
  } catch (error) {
    console.error(`Failed to load font for locale: ${locale}`, error);
    return 'Inter, sans-serif';
  }
}
  

  
    Initialize `i18next` inside your application core, configuring handling mechanisms for Right-to-Left (RTL) typography required by Urdu and Kashmiri.

    Initialize `src/i18n.ts`:
    
typescriptimport i18n from 'i18next';import { initReactI18next } from 'react-react-i18next';import { loadRegionalFont } from './utils/fontLoader';import en from './locales/en.json';
import hi from './locales/hi.json';
import ur from './locales/ur.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ur: { translation: ur }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

// Intercept language changes to adapt the document layer dynamically
i18n.on('languageChanged', async (lng) => {
  // 1. Dynamic Font Injection
  const fontName = await loadRegionalFont(lng);
  document.documentElement.style.setProperty('--app-font-family', `"${fontName}", sans-serif`);

  // 2. Structural Direction Mirroring (For Urdu / Perso-Arabic scripts)
  const isRtl = ['ur', 'ks'].includes(lng);
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
});

export default i18n;
  

  
    Indian typographic glyphs extend both further above the cap-height and below the baseline compared to Latin characters. You must clear standard fixed line-height restrictions in CSS.

    Update your global CSS file (`src/index.css` or `src/App.css`):
    ```css
    :root {
      --app-font-family: 'Inter', sans-serif;
    }

    body {
      font-family: var(--app-font-family);
      /* Use relative, generous line-height structural padding to prevent vowel sign clipping */
      line-height: 1.6; 
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    /* Use Logical Properties for flexible cross-layout compatibility with Urdu RTL */
    .metric-card {
      padding-inline-start: 1.5rem;
      padding-inline-end: 1rem;
      text-align: start;
    }
    ```
  

  
    When your frontend switches context, system elements (such as Native Dialogues, Operating System Menu Items, or system notifications) must be informed via Tauri's Inter-Process Communication (IPC) bus.

    ### 1. Update Rust State Control (`src-tauri/src/lib.rs` or `main.rs`)
    
rustuse std::sync::Mutex;use tauri::State;#[derive(Default)]
pub struct ActiveLanguage(Mutex

