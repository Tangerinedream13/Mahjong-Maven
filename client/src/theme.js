import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      burgundy: "#722F37",
      burgundyDark: "#4A1E24",
      burgundyLight: "#9B4455",
      gold: "#C9A84C",
      goldLight: "#E2C97E",
      buttercup: "#F5C518",
      buttercupLight: "#F9DC6B",
      cream: "#FDF8F0",
      charcoal: "#2D2D2D",
    },
  },
  fonts: {
    heading: `'Georgia', 'Times New Roman', serif`,
    body: `'Inter', 'system-ui', sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: "brand.cream",
        color: "brand.charcoal",
      },
    },
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: "brand.burgundy",
          color: "white",
          _hover: { bg: "brand.burgundyDark" },
        },
        gold: {
          bg: "brand.gold",
          color: "brand.charcoal",
          fontWeight: "bold",
          _hover: { bg: "brand.goldLight" },
        },
        outline: {
          borderColor: "brand.burgundy",
          color: "brand.burgundy",
          _hover: { bg: "brand.burgundy", color: "white" },
        },
      },
      defaultProps: { variant: "solid" },
    },
    Badge: {
      variants: {
        gold: {
          bg: "brand.gold",
          color: "brand.charcoal",
          fontWeight: "bold",
          borderRadius: "full",
          px: 3,
          py: 1,
        },
      },
    },
  },
});

export default theme;
