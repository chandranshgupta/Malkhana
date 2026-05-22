// Map BCP-47 language tags to their corresponding script fonts
const fontMapping = {
  hi: { name: 'Noto Sans Devanagari', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-devanagari-devanagari-400-normal.woff2', fallback: "Mangal, Utsaah, 'Nirmala UI', sans-serif" },
  mr: { name: 'Noto Sans Devanagari', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-devanagari-devanagari-400-normal.woff2', fallback: "Mangal, Utsaah, 'Nirmala UI', sans-serif" },
  sa: { name: 'Noto Sans Devanagari', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-devanagari-devanagari-400-normal.woff2', fallback: "Mangal, Utsaah, 'Nirmala UI', sans-serif" },
  kok: { name: 'Noto Sans Devanagari', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-devanagari-devanagari-400-normal.woff2', fallback: "Mangal, Utsaah, 'Nirmala UI', sans-serif" },
  ne: { name: 'Noto Sans Devanagari', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-devanagari-devanagari-400-normal.woff2', fallback: "Mangal, Utsaah, 'Nirmala UI', sans-serif" },
  brx: { name: 'Noto Sans Devanagari', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-devanagari-devanagari-400-normal.woff2', fallback: "Mangal, Utsaah, 'Nirmala UI', sans-serif" },
  doi: { name: 'Noto Sans Devanagari', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-devanagari-devanagari-400-normal.woff2', fallback: "Mangal, Utsaah, 'Nirmala UI', sans-serif" },
  mai: { name: 'Noto Sans Devanagari', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-devanagari-devanagari-400-normal.woff2', fallback: "Mangal, Utsaah, 'Nirmala UI', sans-serif" },
  bn: { name: 'Noto Sans Bengali', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-bengali/files/noto-sans-bengali-bengali-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-bengali-bengali-400-normal.woff2', fallback: "Vrinda, Shonar Bangla, 'Nirmala UI', sans-serif" },
  as: { name: 'Noto Sans Bengali', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-bengali/files/noto-sans-bengali-bengali-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-bengali-bengali-400-normal.woff2', fallback: "Vrinda, Shonar Bangla, 'Nirmala UI', sans-serif" },
  mni: { name: 'Noto Sans Bengali', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-bengali/files/noto-sans-bengali-bengali-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-bengali-bengali-400-normal.woff2', fallback: "Vrinda, Shonar Bangla, 'Nirmala UI', sans-serif" },
  pa: { name: 'Noto Sans Gurmukhi', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-gurmukhi/files/noto-sans-gurmukhi-gurmukhi-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-gurmukhi-gurmukhi-400-normal.woff2', fallback: "Raavi, 'Nirmala UI', sans-serif" },
  gu: { name: 'Noto Sans Gujarati', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-gujarati/files/noto-sans-gujarati-gujarati-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-gujarati-gujarati-400-normal.woff2', fallback: "Shruti, 'Nirmala UI', sans-serif" },
  or: { name: 'Noto Sans Odia', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-oriya/files/noto-sans-oriya-oriya-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-oriya-oriya-400-normal.woff2', fallback: "Kalinga, 'Nirmala UI', sans-serif" },
  ta: { name: 'Noto Sans Tamil', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-tamil/files/noto-sans-tamil-tamil-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-tamil-tamil-400-normal.woff2', fallback: "Latha, Vijaya, 'Nirmala UI', sans-serif" },
  te: { name: 'Noto Sans Telugu', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-telugu/files/noto-sans-telugu-telugu-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-telugu-telugu-400-normal.woff2', fallback: "Gautami, Vani, 'Nirmala UI', sans-serif" },
  kn: { name: 'Noto Sans Kannada', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kannada/files/noto-sans-kannada-kannada-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-kannada-kannada-400-normal.woff2', fallback: "Tunga, 'Nirmala UI', sans-serif" },
  ml: { name: 'Noto Sans Malayalam', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-malayalam/files/noto-sans-malayalam-malayalam-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-malayalam-malayalam-400-normal.woff2', fallback: "Kartika, 'Nirmala UI', sans-serif" },
  ur: { name: 'Noto Nastaliq Urdu', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-nastaliq-urdu/files/noto-nastaliq-urdu-arabic-400-normal.woff2', fallbackUrl: '/fonts/noto-nastaliq-urdu-arabic-400-normal.woff2', fallback: "'Urdu Typesetting', 'Microsoft Uighur', 'Nirmala UI', sans-serif" },
  ks: { name: 'Noto Nastaliq Urdu', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-nastaliq-urdu/files/noto-nastaliq-urdu-arabic-400-normal.woff2', fallbackUrl: '/fonts/noto-nastaliq-urdu-arabic-400-normal.woff2', fallback: "'Urdu Typesetting', 'Microsoft Uighur', 'Nirmala UI', sans-serif" },
  sd: { name: 'Noto Nastaliq Urdu', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-nastaliq-urdu/files/noto-nastaliq-urdu-arabic-400-normal.woff2', fallbackUrl: '/fonts/noto-nastaliq-urdu-arabic-400-normal.woff2', fallback: "'Urdu Typesetting', 'Microsoft Uighur', 'Nirmala UI', sans-serif" },
  sat: { name: 'Noto Sans Ol Chiki', url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-ol-chiki/files/noto-sans-ol-chiki-ol-chiki-400-normal.woff2', fallbackUrl: '/fonts/noto-sans-ol-chiki-ol-chiki-400-normal.woff2', fallback: "'Nirmala UI', sans-serif" }
};

const loadedFonts = new Set();

export async function loadRegionalFont(locale) {
  const fontMeta = fontMapping[locale];
  if (!fontMeta) return "'Inter', sans-serif";

  if (loadedFonts.has(fontMeta.name)) {
    return `"${fontMeta.name}", ${fontMeta.fallback}`;
  }

  // Try online CDN first
  try {
    const fontFace = new FontFace(fontMeta.name, `url(${fontMeta.url})`, {
      style: 'normal',
      weight: '400 700'
    });

    const loadedFace = await fontFace.load();
    document.fonts.add(loadedFace);
    loadedFonts.add(fontMeta.name);
    console.log(`Successfully loaded font ${fontMeta.name} from CDN`);
    return `"${fontMeta.name}", ${fontMeta.fallback}`;
  } catch (error) {
    console.warn(`Failed to load font ${fontMeta.name} from CDN: ${error.message}. Trying local offline fallback...`);
    
    // Try local offline fallback
    try {
      const fontFace = new FontFace(fontMeta.name, `url(${fontMeta.fallbackUrl})`, {
        style: 'normal',
        weight: '400 700'
      });

      const loadedFace = await fontFace.load();
      document.fonts.add(loadedFace);
      loadedFonts.add(fontMeta.name);
      console.log(`Successfully loaded font ${fontMeta.name} from local offline fallback`);
      return `"${fontMeta.name}", ${fontMeta.fallback}`;
    } catch (fallbackError) {
      console.error(`Failed to load font ${fontMeta.name} from both CDN and offline fallback:`, fallbackError);
      return fontMeta.fallback;
    }
  }
}
