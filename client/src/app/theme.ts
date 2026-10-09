import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#16324f" },
    secondary: { main: "#2a9d8f" },
    background: { default: "#f4f6f8" },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "Inter, system-ui, Arial, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
  },
});
