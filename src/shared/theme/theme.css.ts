import { createTheme, createThemeContract } from "@vanilla-extract/css";

export const vars = createThemeContract({
  color: {
    background: null,
    surface: null,
    surfaceSubtle: null,
    surfaceRaised: null,
    textPrimary: null,
    textSecondary: null,
    textInverse: null,
    border: null,
    borderStrong: null,
    actionPrimary: null,
    actionPrimaryHover: null,
    brandSoft: null,
    brandStrong: null,
    cash: null,
    transfer: null,
    error: null,
    overlay: null,
  },
  space: {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    8: null,
  },
  radius: {
    sm: null,
    md: null,
    lg: null,
    full: null,
  },
  shadow: {
    raised: null,
    sheet: null,
  },
});

const shared = {
  space: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
  },
  radius: {
    sm: "4px",
    md: "6px",
    lg: "8px",
    full: "999px",
  },
};

export const lightTheme = createTheme(vars, {
  ...shared,
  color: {
    background: "#F7FAF8",
    surface: "#FFFFFF",
    surfaceSubtle: "#EEF5F1",
    surfaceRaised: "#FFFFFF",
    textPrimary: "#17211D",
    textSecondary: "#65716B",
    textInverse: "#FFFFFF",
    border: "#DCE6E0",
    borderStrong: "#B9C9C0",
    actionPrimary: "#078765",
    actionPrimaryHover: "#066B51",
    brandSoft: "#C9F4E3",
    brandStrong: "#066B51",
    cash: "#A75C00",
    transfer: "#2563EB",
    error: "#C53B32",
    overlay: "rgba(9, 20, 15, 0.46)",
  },
  shadow: {
    raised: "0 8px 24px rgba(28, 57, 45, 0.08)",
    sheet: "0 -12px 36px rgba(9, 20, 15, 0.16)",
  },
});

export const darkTheme = createTheme(vars, {
  ...shared,
  color: {
    background: "#0D1411",
    surface: "#151D19",
    surfaceSubtle: "#1C2722",
    surfaceRaised: "#202D27",
    textPrimary: "#F3F7F5",
    textSecondary: "#A5B3AC",
    textInverse: "#062A1D",
    border: "#2B3933",
    borderStrong: "#46584F",
    actionPrimary: "#4BD3A2",
    actionPrimaryHover: "#70E0B7",
    brandSoft: "#183C2F",
    brandStrong: "#72E1B8",
    cash: "#F0B45B",
    transfer: "#78A7FF",
    error: "#FF8C82",
    overlay: "rgba(0, 0, 0, 0.68)",
  },
  shadow: {
    raised: "0 8px 24px rgba(0, 0, 0, 0.22)",
    sheet: "0 -12px 36px rgba(0, 0, 0, 0.36)",
  },
});
