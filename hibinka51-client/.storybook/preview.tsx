import React from "react";
import { Preview } from "@storybook/react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { getDesignTokens } from "../src/shared/theme/theme";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => {
      const theme = createTheme(getDesignTokens("light"));

      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
