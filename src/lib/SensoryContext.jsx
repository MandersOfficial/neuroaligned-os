import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const SensoryContext = createContext();

// Maps brain state → which theme to auto-apply
const BRAIN_STATE_THEME_MAP = {
  overwhelmed: 'calm',   // Red zone → Calm Blue
  low_energy:  'calm',   // Blue zone → Calm Blue
  scattered:   'calm',   // Yellow zone → Calm Blue
  neutral:     null,     // No override
  focused:     null,     // No override
};

export const THEMES = {
  default: {
    id: 'default',
    label: 'Default',
    description: 'The standard NeuroAligned palette',
    emoji: '🎨',
    vars: {
      '--background': '240 20% 99%',
      '--foreground': '250 25% 10%',
      '--primary': '258 62% 55%',
      '--card': '0 0% 100%',
      '--secondary': '255 15% 95%',
      '--muted': '250 10% 95%',
      '--muted-foreground': '250 10% 45%',
      '--border': '250 12% 90%',
      '--ring': '258 62% 55%',
    },
    darkVars: {
      '--background': '250 25% 6%',
      '--foreground': '240 20% 96%',
      '--primary': '258 62% 60%',
      '--card': '250 20% 9%',
      '--secondary': '250 15% 15%',
      '--muted': '250 15% 15%',
      '--muted-foreground': '250 10% 55%',
      '--border': '250 15% 18%',
      '--ring': '258 62% 60%',
    },
  },
  calm: {
    id: 'calm',
    label: 'Calm Blue',
    description: 'Soft blues and muted tones — reduces visual stress',
    emoji: '🌊',
    vars: {
      '--background': '210 40% 97%',
      '--foreground': '215 30% 15%',
      '--primary': '210 60% 45%',
      '--card': '210 30% 99%',
      '--secondary': '210 20% 93%',
      '--muted': '210 20% 93%',
      '--muted-foreground': '210 15% 50%',
      '--border': '210 20% 88%',
      '--ring': '210 60% 45%',
    },
    darkVars: {
      '--background': '210 30% 8%',
      '--foreground': '210 20% 94%',
      '--primary': '205 65% 60%',
      '--card': '210 25% 11%',
      '--secondary': '210 20% 16%',
      '--muted': '210 20% 16%',
      '--muted-foreground': '210 12% 60%',
      '--border': '210 20% 20%',
      '--ring': '205 65% 60%',
    },
  },
  highContrast: {
    id: 'highContrast',
    label: 'High Contrast',
    description: 'Maximum contrast for visibility and focus',
    emoji: '⚫',
    vars: {
      '--background': '0 0% 100%',
      '--foreground': '0 0% 0%',
      '--primary': '270 100% 40%',
      '--card': '0 0% 98%',
      '--secondary': '0 0% 92%',
      '--muted': '0 0% 92%',
      '--muted-foreground': '0 0% 20%',
      '--border': '0 0% 60%',
      '--ring': '270 100% 40%',
    },
    darkVars: {
      '--background': '0 0% 0%',
      '--foreground': '0 0% 100%',
      '--primary': '270 100% 70%',
      '--card': '0 0% 7%',
      '--secondary': '0 0% 14%',
      '--muted': '0 0% 14%',
      '--muted-foreground': '0 0% 85%',
      '--border': '0 0% 70%',
      '--ring': '270 100% 70%',
    },
  },
  warm: {
    id: 'warm',
    label: 'Warm Sand',
    description: 'Warm, low-stimulation tones — easier on anxious minds',
    emoji: '🏜️',
    vars: {
      '--background': '35 40% 97%',
      '--foreground': '30 25% 12%',
      '--primary': '25 70% 45%',
      '--card': '35 30% 99%',
      '--secondary': '35 20% 93%',
      '--muted': '35 20% 93%',
      '--muted-foreground': '30 15% 50%',
      '--border': '30 20% 87%',
      '--ring': '25 70% 45%',
    },
    darkVars: {
      '--background': '30 20% 8%',
      '--foreground': '35 20% 94%',
      '--primary': '25 75% 58%',
      '--card': '30 18% 11%',
      '--secondary': '30 15% 16%',
      '--muted': '30 15% 16%',
      '--muted-foreground': '30 12% 62%',
      '--border': '30 15% 20%',
      '--ring': '25 75% 58%',
    },
  },
};

const STORAGE_KEY = 'na_sensory_prefs';

const defaultPrefs = {
  manualTheme: 'default',       // user's chosen theme
  autoBrainStateTheme: true,    // auto-switch on brain state
  dyslexiaFont: false,          // OpenDyslexic-style font
  reducedMotion: false,         // disable framer-motion animations
  largerText: false,            // bump base font size
  darkMode: false,              // dark mode
  readerVoiceId: '',            // '' = free device voice; ElevenLabs voice id for premium
  readerVoiceName: '',          // display name of the chosen reader voice
  readAloudAuto: false,         // read each page aloud automatically on arrival
};

function systemPrefersDark() {
  try {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  } catch {
    return false;
  }
}

function loadPrefs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultPrefs, ...JSON.parse(stored) };
  } catch {
    // fall through
  }
  // No cached preference yet — follow the system color-scheme on first run
  return { ...defaultPrefs, darkMode: systemPrefersDark() };
}

function applyTheme(themeId, darkMode) {
  const root = document.documentElement;
  root.classList.toggle('dark', darkMode);
  // Every palette ships a light AND a dark set, so the chosen palette applies
  // in either mode — picking a palette always visibly changes the app.
  const theme = THEMES[themeId] || THEMES.default;
  const vars = darkMode ? theme.darkVars : theme.vars;
  Object.entries(vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
}

function applyAccessibility(prefs) {
  const root = document.documentElement;

  // Dyslexia font
  if (prefs.dyslexiaFont) {
    root.style.setProperty('--font-inter', '"OpenDyslexic", "Comic Sans MS", cursive');
    root.style.setProperty('--font-display', '"OpenDyslexic", "Comic Sans MS", cursive');
  } else {
    root.style.removeProperty('--font-inter');
    root.style.removeProperty('--font-display');
  }

  // Larger text
  root.style.fontSize = prefs.largerText ? '18px' : '';

  // Reduced motion
  if (prefs.reducedMotion) {
    root.style.setProperty('--motion-duration', '0ms');
    const style = document.getElementById('na-reduced-motion');
    if (!style) {
      const s = document.createElement('style');
      s.id = 'na-reduced-motion';
      s.textContent = '*, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }';
      document.head.appendChild(s);
    }
  } else {
    const style = document.getElementById('na-reduced-motion');
    if (style) style.remove();
  }
}

export function SensoryProvider({ children }) {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [activeThemeId, setActiveThemeId] = useState(prefs.manualTheme);
  // True once a dark-mode choice has been cached — stops following the system
  const manualDark = useRef((() => { try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; } })());

  // Apply on mount + whenever prefs change
  useEffect(() => {
    applyTheme(activeThemeId, prefs.darkMode);
    applyAccessibility(prefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs, activeThemeId]);

  // Keep dark mode in sync with the system until the user picks it manually
  useEffect(() => {
    let mql;
    try { mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)'); } catch { /* ignore */ }
    if (!mql) return;
    const handler = (e) => { if (!manualDark.current) setPrefs(p => ({ ...p, darkMode: e.matches })); };
    if (mql.addEventListener) mql.addEventListener('change', handler);
    else mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler);
      else mql.removeListener(handler);
    };
  }, []);

  const updatePref = useCallback((key, value) => {
    if (key === 'darkMode') manualDark.current = true;
    // Keep the active theme id in sync outside the state updater (updaters
    // must stay pure — nesting a setState there can drop the change).
    if (key === 'manualTheme') setActiveThemeId(value);
    setPrefs(prev => ({ ...prev, [key]: value }));
  }, []);

  // Called from CheckIn when brain state is saved
  const applyBrainStateTheme = useCallback((brainStateValue) => {
    if (!prefs.autoBrainStateTheme) return;
    const override = BRAIN_STATE_THEME_MAP[brainStateValue];
    if (override) {
      setActiveThemeId(override);
    } else {
      // Restore manual choice
      setActiveThemeId(prefs.manualTheme);
    }
  }, [prefs.autoBrainStateTheme, prefs.manualTheme]);

  return (
    <SensoryContext.Provider value={{ prefs, updatePref, activeThemeId, applyBrainStateTheme }}>
      {children}
    </SensoryContext.Provider>
  );
}

export function useSensory() {
  return useContext(SensoryContext);
}