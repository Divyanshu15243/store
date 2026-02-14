import useTranslation from "next-translate/useTranslation";

const useCustomTranslation = () => {
  const { t: originalT, lang } = useTranslation();

  const t = (key) => {
    const translation = originalT(key);
    
    // If translation returns the key with "common:" prefix, strip it
    if (typeof translation === 'string' && translation.startsWith('common:')) {
      return translation.replace('common:', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return translation;
  };

  return { t, lang };
};

export default useCustomTranslation;
