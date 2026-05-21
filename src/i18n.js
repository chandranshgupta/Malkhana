import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { loadRegionalFont } from './utils/fontLoader';

const resources = {
  en: {
    translation: {
      "EVIDENCE_LOG": "Evidence Log",
      "ACTIVE_CUSTODY": "Active Custody",
      "SEALED_ARCHIVE": "Sealed Archive",
      "REPORTS": "Reports",
      "AUDIT_TRAIL": "Audit Trail",
      "SYSTEM_SETTINGS": "System Settings",
      "NEW_INGESTION": "New Ingestion",
      "search_placeholder": "Search Evidence ID / Case / Custodian...",
      "logged_in_as": "Logged in as",
      "role": "Role",
      "sign_out": "Sign Out",
      "movement_register": "Movement Register",
      "investigation_board": "Investigation Board",
      "print_register": "Print Movement Register"
    }
  },
  hi: {
    translation: {
      "EVIDENCE_LOG": "साक्ष्य लॉग",
      "ACTIVE_CUSTODY": "सक्रिय हिरासत",
      "SEALED_ARCHIVE": "सील पुरालेख",
      "REPORTS": "रिपोर्ट्स",
      "AUDIT_TRAIL": "ऑडिट ट्रेल",
      "SYSTEM_SETTINGS": "सिस्टम सेटिंग्स",
      "NEW_INGESTION": "नया अंतर्ग्रहण",
      "search_placeholder": "साक्ष्य आईडी / केस / कस्टोडियन खोजें...",
      "logged_in_as": "लॉग इन उपयोगकर्ता",
      "role": "भूमिका",
      "sign_out": "साइन आउट",
      "movement_register": "मूवमेंट रजिस्टर (हलचल बही)",
      "investigation_board": "जांच बोर्ड",
      "print_register": "मूवमेंट रजिस्टर प्रिंट करें"
    }
  },
  ur: {
    translation: {
      "EVIDENCE_LOG": "ثبوت لاگ",
      "ACTIVE_CUSTODY": "سرگرم تحویل",
      "SEALED_ARCHIVE": "مہر بند آرکائیو",
      "REPORTS": "رپورٹس",
      "AUDIT_TRAIL": "آڈٹ ٹریل",
      "SYSTEM_SETTINGS": "سستم ترتیبات",
      "NEW_INGESTION": "نیا ادخال",
      "search_placeholder": "ثبوت آئی ڈی / کیس / نگران تلاش کریں...",
      "logged_in_as": "لاگ ان شدہ",
      "role": "عہدہ",
      "sign_out": "سائن آؤٹ",
      "movement_register": "رجسٹر نقل و حرکت",
      "investigation_board": "تحقیقاتی بورڈ",
      "print_register": "رجسٹر نقل و حرکت پرنٹ کریں"
    }
  },
  ks: {
    translation: {
      "EVIDENCE_LOG": "ثبوت لاگ",
      "ACTIVE_CUSTODY": "سرگرم تحویل",
      "SEALED_ARCHIVE": "مہر بند آرکائیو",
      "REPORTS": "رپورٹس",
      "AUDIT_TRAIL": "آڈٹ ٹریل",
      "SYSTEM_SETTINGS": "سستم ترتیبات",
      "NEW_INGESTION": "نیا ادخال",
      "search_placeholder": "تلاش کریں...",
      "logged_in_as": "لاگ ان",
      "role": "عہدہ",
      "sign_out": "سائن آؤٹ",
      "movement_register": "رجسٹر نقل و حرکت",
      "investigation_board": "تحقیقاتی بورڈ",
      "print_register": "رجسٹر نقل و حرکت پرنٹ کریں"
    }
  },
  pa: {
    translation: {
      "EVIDENCE_LOG": "ਸਬੂਤ ਲੌਗ",
      "ACTIVE_CUSTODY": "ਸਰਗਰਮ ਹਿਰਾਸਤ",
      "SEALED_ARCHIVE": "ਸੀਲਬੰਦ ਆਰਕਾਈਵ",
      "REPORTS": "ਰਿਪੋਰਟਾਂ",
      "AUDIT_TRAIL": "ਆਡਿਟ ਟ੍ਰੇਲ",
      "SYSTEM_SETTINGS": "ਸਿਸਟਮ ਸੈਟਿੰਗਜ਼",
      "NEW_INGESTION": "ਨਵਾਂ ਇੰਜੈਸ਼ਨ",
      "search_placeholder": "ਖੋਜੋ...",
      "logged_in_as": "ਲੌਗਇਨ",
      "role": "ਭੂਮਿਕਾ",
      "sign_out": "ਸਾਈਨ ਆਊਟ",
      "movement_register": "ਮੂਵਮੈਂਟ ਰਜਿਸਟਰ",
      "investigation_board": "ਜਾਂਚ ਬੋਰਡ",
      "print_register": "ਮੂਵਮੈਂਟ ਰਜਿਸਟਰ ਪ੍ਰਿੰਟ ਕਰੋ"
    }
  },
  bn: {
    translation: {
      "EVIDENCE_LOG": "সাক্ষ্য লগ",
      "ACTIVE_CUSTODY": "সক্রিয় হেফাজত",
      "SEALED_ARCHIVE": "সিল করা সংরক্ষণাগার",
      "REPORTS": "রিপোর্ট",
      "AUDIT_TRAIL": "অডিট ট্রেইল",
      "SYSTEM_SETTINGS": "সিস্টেম সেটিংস",
      "NEW_INGESTION": "নতুন ভুক্তি",
      "search_placeholder": "অনুসন্ধান করুন...",
      "logged_in_as": "লগ ইন",
      "role": "ভূমিকা",
      "sign_out": "সাইন আউট",
      "movement_register": "মুভমেন্ট রেজিস্টার",
      "investigation_board": "তদন্ত বোর্ড",
      "print_register": "মুভমেন্ট রেজিস্টার প্রিন্ট করুন"
    }
  },
  as: {
    translation: {
      "EVIDENCE_LOG": "সাক্ষ্য লগ",
      "ACTIVE_CUSTODY": "সক্ৰিয় জিম্মা",
      "SEALED_ARCHIVE": "সিল কৰা আৰ্কাইভ",
      "REPORTS": "প্ৰতিবেদন",
      "AUDIT_TRAIL": "অডিট ট্ৰেইল",
      "SYSTEM_SETTINGS": "চিষ্টেম ছেটিংচ",
      "NEW_INGESTION": "নতুন ভুক্তি",
      "search_placeholder": "সন্ধান কৰক...",
      "logged_in_as": "লগইন",
      "role": "ভূমিকা",
      "sign_out": "লগ আউট",
      "movement_register": "মুভমেণ্ট ৰেজিষ্টাৰ",
      "investigation_board": "তদন্ত ব'ৰ্ড",
      "print_register": "মুভমেণ্ট ৰেজিষ্টাৰ প্ৰিন্ট কৰক"
    }
  },
  gu: {
    translation: {
      "EVIDENCE_LOG": "પુરાવા લોગ",
      "ACTIVE_CUSTODY": "સક્રિય કસ્ટડી",
      "SEALED_ARCHIVE": "સીલબંધ આર્કાઇવ",
      "REPORTS": "અહેવાલો",
      "AUDIT_TRAIL": "ઓડિટ ટ્રેઇલ",
      "SYSTEM_SETTINGS": "સિસ્ટમ સેટિંગ્સ",
      "NEW_INGESTION": "નવી નોંધણી",
      "search_placeholder": "શોધો...",
      "logged_in_as": "લોગ ઇન",
      "role": "ભૂમિકા",
      "sign_out": "સાઇન આઉટ",
      "movement_register": "મૂવમેન્ટ રજિસ્ટર",
      "investigation_board": "તપાસ બોર્ડ",
      "print_register": "મૂવમેન્ટ રજિસ્ટર પ્રિન્ટ કરો"
    }
  },
  mr: {
    translation: {
      "EVIDENCE_LOG": "पुरावा नोंद",
      "ACTIVE_CUSTODY": "सक्रिय ताबा",
      "SEALED_ARCHIVE": "शिक्काबंद संग्रह",
      "REPORTS": "अहवाल",
      "AUDIT_TRAIL": "ऑडिट ट्रेल",
      "SYSTEM_SETTINGS": "सिस्टम सेटिंग्ज",
      "NEW_INGESTION": "नवीन नोंदणी",
      "search_placeholder": "शोधा...",
      "logged_in_as": "लॉग इन",
      "role": "भूमिका",
      "sign_out": "साइन आउट",
      "movement_register": "हालचाल नोंदवही",
      "investigation_board": "तपास मंडळ",
      "print_register": "नोंदवही मुद्रित करा"
    }
  },
  or: {
    translation: {
      "EVIDENCE_LOG": "ପ୍ରମାଣ ଲଗ୍",
      "ACTIVE_CUSTODY": "ସକ୍ରିୟ ହେପାଜତ",
      "SEALED_ARCHIVE": "ସିଲ୍ ସଂରକ୍ଷଣାଗାର",
      "REPORTS": "ରିପୋର୍ଟ",
      "AUDIT_TRAIL": "ଅଡିଟ୍ ଟ୍ରେଲ୍",
      "SYSTEM_SETTINGS": "ସିଷ୍ଟମ୍ ସେଟିଙ୍ଗ୍ସ",
      "NEW_INGESTION": "ନୂତନ ପ୍ରବେଶ",
      "search_placeholder": "ଖୋଜନ୍ତୁ...",
      "logged_in_as": "ଲଗ୍-ଇନ୍",
      "role": "ଭୂମಿಕା",
      "sign_out": "ସାଇନ୍ ଆଉਟ୍",
      "movement_register": "ମୁଭମେଣ୍ଟ ରେଜିଷ୍ଟର",
      "investigation_board": "ତଦନ୍ତ ବୋର୍ଡ",
      "print_register": "ରେଜିଷ୍ٹର ପ୍ରିଣ୍ଟ କରନ୍ତୁ"
    }
  },
  ta: {
    translation: {
      "EVIDENCE_LOG": "ஆதாரப் பதிவு",
      "ACTIVE_CUSTODY": "செயலில் உள்ள காவல்",
      "SEALED_ARCHIVE": "முத்திரையிடப்பட்ட காப்பகம்",
      "REPORTS": "அறிக்கைகள்",
      "AUDIT_TRAIL": "தணிக்கைப் பதிவு",
      "SYSTEM_SETTINGS": "அமைப்பு அமைப்புகள்",
      "NEW_INGESTION": "புதிய சேர்க்கை",
      "search_placeholder": "தேடுக...",
      "logged_in_as": "உள்நுழைந்துள்ளவர்",
      "role": "பங்கு",
      "sign_out": "வெளியேறு",
      "movement_register": "இயக்கப் பதிவேடு",
      "investigation_board": "விசாரணை வாரியம்",
      "print_register": "இயக்கப் பதிவேட்டை அச்சிடுக"
    }
  },
  te: {
    translation: {
      "EVIDENCE_LOG": "సాక్ష్యాధారాల లాగ్",
      "ACTIVE_CUSTODY": "కస్టడీలో ఉన్నవి",
      "SEALED_ARCHIVE": "సీల్డ్ ఆర్కైవ్",
      "REPORTS": "निवेदिकालु",
      "AUDIT_TRAIL": "ఆడిట్ ట్రైల్",
      "SYSTEM_SETTINGS": "సిస్టమ్ సెట్టింగులు",
      "NEW_INGESTION": "కొత్త చేర్పు",
      "search_placeholder": "వెతకండి...",
      "logged_in_as": "లాగిన్ అయిన వారు",
      "role": "పాత్ర",
      "sign_out": "లాగ్ అవుట్",
      "movement_register": "మూవ్‌మెంట్ రిజిస్టర్",
      "investigation_board": "విచారణ బోర్డు",
      "print_register": "రిజిస్టర్ ప్రింట్ చేయండి"
    }
  },
  kn: {
    translation: {
      "EVIDENCE_LOG": "ಸಾಕ್ಷ್ಯ ಲಾಗ್",
      "ACTIVE_CUSTODY": "ಸಕ್ರಿಯ ಕಸ್ಟಡಿ",
      "SEALED_ARCHIVE": "ಮೊಹರು ಮಾಡಿದ ಆರ್ಕೈವ್",
      "REPORTS": "ವರದಿಗಳು",
      "AUDIT_TRAIL": "ಆಡಿಟ್ ಟ್ರಯಲ್",
      "SYSTEM_SETTINGS": "ಸಿಸ್ಟಂ ಸೆಟ್ಟಿಂಗ್ಸ್",
      "NEW_INGESTION": "ಹೊಸ ದಾಖಲಾತಿ",
      "search_placeholder": "ಹುಡುಕಿ...",
      "logged_in_as": "ಲಾಗಿನ್ ಆದವರು",
      "role": "ಪಾತ್ರ",
      "sign_out": "ಸೈನ್ ಔಟ್",
      "movement_register": "ಚಲನ ವಹಿ",
      "investigation_board": "ತನಿಖಾ ಮಂಡಳಿ",
      "print_register": "ಚಲನ ವಹಿ ಪ್ರಿಂಟ್ ಮಾಡಿ"
    }
  },
  ml: {
    translation: {
      "EVIDENCE_LOG": "തെളിവ് ലോഗ്",
      "ACTIVE_CUSTODY": "സജീവ കസ്റ്റഡി",
      "SEALED_ARCHIVE": "സീൽ ചെയ്ത ആർക്കൈവ്",
      "REPORTS": "റിപ്പോർട്ടുകൾ",
      "AUDIT_TRAIL": "ഓഡിറ്റ് ട്രയൽ",
      "SYSTEM_SETTINGS": "സിസ്റ്റം ക്രമീകരണങ്ങൾ",
      "NEW_INGESTION": "പുതിയ എൻട്രി",
      "search_placeholder": "തിരയുക...",
      "logged_in_as": "ലോഗിൻ ചെയ്തത്",
      "role": "പദവി",
      "sign_out": "ലോഗ് ഔട്ട്",
      "movement_register": "മൂവ്മെന്റ് രജിസ്റ്റർ",
      "investigation_board": "അന്വേഷണ ബോർഡ്",
      "print_register": "രജിസ്റ്റർ പ്രിന്റ് ചെയ്യുക"
    }
  },
  sa: {
    translation: {
      "EVIDENCE_LOG": "साक्ष्यलेखः",
      "ACTIVE_CUSTODY": "सक्रिय-अभिरक्षा",
      "SEALED_ARCHIVE": "मुद्रित-अभिलेखागारः",
      "REPORTS": "विवरणानि",
      "AUDIT_TRAIL": "लेखापरीक्षणम्",
      "SYSTEM_SETTINGS": "तन्त्र-सज्जीकरणम्",
      "NEW_INGESTION": "नवीन-सङ्ग्रहणम्",
      "search_placeholder": "अन्वेषणं कुरु...",
      "logged_in_as": "प्रविष्ठः",
      "role": "भूमिका",
      "sign_out": "निर्गमनम्",
      "movement_register": "गमनागमन पञ्जी",
      "investigation_board": "अनुसन्धानफलकम्",
      "print_register": "पञ्जी मुद्रणम्"
    }
  },
  kok: {
    translation: {
      "EVIDENCE_LOG": "पुरावो नोंद",
      "ACTIVE_CUSTODY": "सक्रिय ताबो",
      "SEALED_ARCHIVE": "सील केल्लो आलेख",
      "REPORTS": "अहवाल",
      "AUDIT_TRAIL": "ऑडिट ट्रेल",
      "SYSTEM_SETTINGS": "सिस्टम मांडणी",
      "NEW_INGESTION": "नवी नोंद",
      "search_placeholder": "शोधात...",
      "logged_in_as": "भीतर सरिल्लो",
      "role": "भूमिका",
      "sign_out": "भायर वचात",
      "movement_register": "मूवमेंट रजिस्टर",
      "investigation_board": "चौकशी बोर्ड",
      "print_register": "रजिस्टर छापून काढा"
    }
  },
  ne: {
    translation: {
      "EVIDENCE_LOG": "प्रमाण लग",
      "ACTIVE_CUSTODY": "सक्रिय हिरासत",
      "SEALED_ARCHIVE": "सिल्ड आर्काइभ",
      "REPORTS": "रिपोर्टहरू",
      "AUDIT_TRAIL": "अडिट ट्रेल",
      "SYSTEM_SETTINGS": "प्रणाली सेटिङ",
      "NEW_INGESTION": "नयाँ प्रविष्टि",
      "search_placeholder": "खोज्नुहोस्...",
      "logged_in_as": "लॉगइन",
      "role": "भूमिका",
      "sign_out": "साइन आउट",
      "movement_register": "चलनवहन रजिस्टर",
      "investigation_board": "अनुसन्धान बोर्ड",
      "print_register": "रजिस्टर प्रिन्ट गर्नुहोस्"
    }
  },
  sd: {
    translation: {
      "EVIDENCE_LOG": "ثبوت لاگ",
      "ACTIVE_CUSTODY": "سرگرم تحويل",
      "SEALED_ARCHIVE": "مهر بند آرڪائيو",
      "REPORTS": "رپورٽون",
      "AUDIT_TRAIL": "آڊٽ ٽريل",
      "SYSTEM_SETTINGS": "سسٽم سيٽنگون",
      "NEW_INGESTION": "نئون داخلا",
      "search_placeholder": "ڳولا...",
      "logged_in_as": "لاگ ان ٿيل",
      "role": "عهدو",
      "sign_out": "سائن آئوٽ",
      "movement_register": "رجسٽر حرڪت",
      "investigation_board": "تحقيقاتي بورڊ",
      "print_register": "رجسٽر پرنٽ ڪريو"
    }
  },
  brx: {
    translation: {
      "EVIDENCE_LOG": "फोरमान बिलि",
      "ACTIVE_CUSTODY": "मवफुं जिम्मा",
      "SEALED_ARCHIVE": "मोहर खालामनाय दोनखुं",
      "REPORTS": "फोरमानलाइ",
      "AUDIT_TRAIL": "लेखा आनजाद",
      "SYSTEM_SETTINGS": "सिस्टम गोरोबहोनाय",
      "NEW_INGESTION": "गोदान हाबनाय",
      "search_placeholder": "नागिर...",
      "logged_in_as": "हाबबाय",
      "role": "बिबान",
      "sign_out": "अंखारनाय",
      "movement_register": "मूवमेंट रजिस्टर",
      "investigation_board": "बिजिरनाय बर्ड",
      "print_register": "रजिस्टर छापने"
    }
  },
  doi: {
    translation: {
      "EVIDENCE_LOG": "सबूत लाग",
      "ACTIVE_CUSTODY": "सक्रिय हिरासत",
      "SEALED_ARCHIVE": "सील कीती दी आर्काइव",
      "REPORTS": "रिपोर्टां",
      "AUDIT_TRAIL": "ऑडिट ट्रेल",
      "SYSTEM_SETTINGS": "सिस्टम सेटिंग",
      "NEW_INGESTION": "नमीं प्रविष्टि",
      "search_placeholder": "खोजो...",
      "logged_in_as": "लॉगइन",
      "role": "भूमिका",
      "sign_out": "साइन आउट",
      "movement_register": "मूवमेंट रजिस्टर",
      "investigation_board": "जांच बोर्ड",
      "print_register": "रजिस्टर प्रिंट करो"
    }
  },
  mai: {
    translation: {
      "EVIDENCE_LOG": "साक्ष्य लॉग",
      "ACTIVE_CUSTODY": "सक्रिय हिरासत",
      "SEALED_ARCHIVE": "सिल्ड आर्काइभ",
      "REPORTS": "रिपोर्ट सभ",
      "AUDIT_TRAIL": "ऑडिट ट्रेल",
      "SYSTEM_SETTINGS": "सिस्टम सेटिंग्स",
      "NEW_INGESTION": "नब अंतर्ग्रहण",
      "search_placeholder": "खोजू...",
      "logged_in_as": "लॉगइन",
      "role": "भूमिका",
      "sign_out": "साइन आउट",
      "movement_register": "मूवमेंट रजिस्टर",
      "investigation_board": "जांच बोर्ड",
      "print_register": "रजिस्टर प्रिंट करू"
    }
  },
  mni: {
    translation: {
      "EVIDENCE_LOG": "খুদিং লোগ",
      "ACTIVE_CUSTODY": "কস্তোদী লোগ",
      "SEALED_ARCHIVE": "সিল তৌবা আলেক",
      "REPORTS": "রিপোর্তশিং",
      "AUDIT_TRAIL": "অদিত ত্রেল",
      "SYSTEM_SETTINGS": "সিস্তেম সেত্তিংস",
      "NEW_INGESTION": "অনৌবা ইনজেস্ত",
      "search_placeholder": "থীজগৌ...",
      "logged_in_as": "লগইন",
      "role": "রোল",
      "sign_out": "সাইন আউত",
      "movement_register": "মুভমেন্ত রেজিস্তর",
      "investigation_board": "তদন্ত বোর্দ",
      "print_register": "রেজিস্তর প্রিন্ত তৌ"
    }
  },
  sat: {
    translation: {
      "EVIDENCE_LOG": "ᱥᱟᱹᱵᱩᱫᱽ ᱞᱚᱜᱽ",
      "ACTIVE_CUSTODY": "ᱥᱚᱠᱨᱤᱭᱚ ᱡᱤᱢᱢᱟ",
      "SEALED_ARCHIVE": "ᱥᱤᱞ ᱟᱠᱟᱱ ᱟᱨᱠᱟᱭᱤᱵᱽ",
      "REPORTS": "ᱨᱤᱯᱚᱨᱴ",
      "AUDIT_TRAIL": "ᱚᱰᱤᱴ ᱴᱨᱮᱞ",
      "SYSTEM_SETTINGS": "ᱥᱤᱥᱴᱮᱢ ᱥᱮᱴᱤᱝ",
      "NEW_INGESTION": "ᱱᱟᱣᱟ ᱵᱚᱞᱚᱱ",
      "search_placeholder": "ᱥᱮᱸᱫᱽᱨᱟᱭ ᱢᱮ...",
      "logged_in_as": "ᱵᱚᱞᱚ ᱟᱠᱟᱱᱟ",
      "role": "ᱨᱳᱞ",
      "sign_out": "ᱵᱟᱦᱮᱨᱚᱜ ᱢᱮ",
      "movement_register": "ᱢᱩᱵᱷᱢᱮᱱᱴ ᱨᱮᱡᱤᱥᱴᱚᱨ",
      "investigation_board": "ᱛᱚᱞᱟᱥ ᱵᱳᱨᱰ",
      "print_register": "ᱨᱮᱡᱤᱥᱴᱚᱨ ᱪᱷᱟᱯᱟᱭ ᱢᱮ"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', async (lng) => {
  const fontStyle = await loadRegionalFont(lng);
  document.documentElement.style.setProperty('--app-font-family', fontStyle);

  const isRtl = ['ur', 'ks', 'sd'].includes(lng);
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
});

export default i18n;
