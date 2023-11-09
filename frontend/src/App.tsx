import { ThemeProvider, createTheme } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Content from "./components/Content";

const client = new QueryClient();

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#47b2e4",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={client}>
        <Content />
        <div id="bg-img"></div>
        <div id="bg-img-mask"></div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
