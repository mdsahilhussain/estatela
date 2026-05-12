export const colors = {
    background: "#f2f2f2",
    foreground: "#0a0a0a",
    card: "#ffffff",
    muted: "#525252",
    mutedForeground: "#737373",
    primary: "#262626",
    accent: "#2b7fff",
    border: "#404040",
    success: "#16a34a",
    destructive: "#dc2626",
    subscription: "#8fd1bd",
  } as const;
  
  export const spacing = {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    18: 72,
    20: 80,
    24: 96,
    30: 120,
  } as const;
  
  export const components = {
    tabBar: {
        height: spacing[18],
        horizontalInset: spacing[5],
        radius: spacing[8],
        iconFrame: spacing[12],
        itemPaddingVertical: spacing[2],
    },
  } as const;
  
  export const theme = {
    colors,
    spacing,
    components,
  } as const;