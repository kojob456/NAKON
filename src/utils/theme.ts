export type AppThemeType = "white" | "black";

export interface ThemeStyle {
  id: AppThemeType;
  name: string;
  dotColor: string; // Color circle helper for switcher
  bg: string;              // Main body background
  card: string;            // Card and component panels background
  border: string;          // Borders
  text: string;            // Main body headers / paragraphs
  textMuted: string;       // Secondary info / subheadings
  accent: string;          // Action backgrounds (blue based mostly, tailored per theme)
  accentHover: string;     // Hover action bg
  accentText: string;      // Action text (like deep blue or dark text)
  input: string;           // Input field backgrounds
  inputBorder: string;     // Input borders
  divider: string;         // Divider styling
}

export const themes: Record<AppThemeType, ThemeStyle> = {
  white: {
    id: "white",
    name: "สว่าง (Light Mode)",
    dotColor: "bg-white border-slate-300",
    bg: "bg-slate-50",
    card: "bg-white border-slate-200 shadow-sm",
    border: "border-slate-200",
    text: "text-slate-900",
    textMuted: "text-slate-500",
    accent: "bg-blue-600",
    accentHover: "hover:bg-blue-700",
    accentText: "text-blue-600",
    input: "bg-white",
    inputBorder: "border-slate-300 focus:ring-blue-500",
    divider: "border-slate-200",
  },
  black: {
    id: "black",
    name: "มืด (Dark Mode)",
    dotColor: "bg-slate-900 border-slate-700",
    bg: "bg-slate-950",
    card: "bg-slate-900 border-slate-800 shadow-sm",
    border: "border-slate-800",
    text: "text-slate-100",
    textMuted: "text-slate-400",
    accent: "bg-blue-600",
    accentHover: "hover:bg-blue-700",
    accentText: "text-blue-400",
    input: "bg-slate-950",
    inputBorder: "border-slate-800 focus:ring-blue-500",
    divider: "border-slate-800",
  },
};

export const getThemeStyle = (
  themeId: AppThemeType,
  isHighContrast: boolean
): ThemeStyle => {
  if (isHighContrast) {
    // Override with pure high contrast style
    return {
      id: "black",
      name: "โหมดความต่างสีสูง (High Contrast)",
      dotColor: "bg-black border-white",
      bg: "bg-black",
      card: "bg-black border-2 border-white text-white",
      border: "border-white",
      text: "text-white font-black",
      textMuted: "text-yellow-400 font-bold",
      accent: "bg-yellow-400 border-2 border-yellow-400 text-black font-black",
      accentHover: "hover:bg-yellow-500",
      accentText: "text-yellow-400",
      input: "bg-black text-white font-bold",
      inputBorder: "border-2 border-white focus:ring-yellow-400",
      divider: "border-2 border-white",
    };
  }

  return themes[themeId] || themes.white;
};
