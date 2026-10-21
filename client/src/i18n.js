import { createContext, useContext, useState } from 'react';
// Add a language by adding a key here; untranslated strings fall back to English.
const D = {
  hi: { Dashboard: 'डैशबोर्ड', Farms: 'खेत', Crops: 'फसलें', Weather: 'मौसम', Market: 'बाज़ार', Community: 'समुदाय', Admin: 'एडमिन', 'Log out': 'लॉग आउट', 'Log in': 'लॉग इन', Register: 'पंजीकरण', Email: 'ईमेल', Password: 'पासवर्ड', Name: 'नाम', Save: 'सहेजें', Delete: 'हटाएं', 'Add farm': 'खेत जोड़ें', 'Add crop': 'फसल जोड़ें', 'Place order': 'ऑर्डर करें', Add: 'जोड़ें', Cart: 'कार्ट', Total: 'कुल', Alerts: 'चेतावनियाँ', 'Pest alerts': 'कीट चेतावनी', Forum: 'फोरम', 'Ask an expert': 'विशेषज्ञ से पूछें', Reply: 'जवाब दें', Post: 'पोस्ट करें', 'Soil health': 'मिट्टी की सेहत', 'Select a farm': 'खेत चुनें' },
  mr: { Dashboard: 'डॅशबोर्ड', Farms: 'शेते', Crops: 'पिके', Weather: 'हवामान', Market: 'बाजार', Community: 'समुदाय', 'Log out': 'बाहेर पडा', 'Log in': 'लॉग इन', Register: 'नोंदणी' }
};
export const LANGS = { en: 'English', hi: 'हिन्दी', mr: 'मराठी' };
const Ctx = createContext();
export const useT = () => useContext(Ctx);
export function LangProvider({ children }) {
  const [lang, setLangState] = useState(localStorage.getItem('lang') || 'en');
  const setLang = l => { localStorage.setItem('lang', l); document.documentElement.lang = l; setLangState(l); };
  const t = s => (lang !== 'en' && D[lang]?.[s]) || s;
  return <Ctx.Provider value={{ t, lang, setLang }}>{children}</Ctx.Provider>;
}
