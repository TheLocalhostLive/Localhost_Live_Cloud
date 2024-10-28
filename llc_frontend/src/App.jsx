import ConsolePage from "./components/ConsolePage";
import Dashboard from "./components/Dashboard";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./components/LandingPage";
//import Deploy from "./components/Deploy";
import VirtulMatchine from "./components/VirtulMatchine";
import Payment from "./components/Payment";
import { useLoading } from "./hook/useLoader";
import { Backdrop, CircularProgress } from "@mui/material";
import HostPage from "./components/HostPage";
import Footer from "./components/Footer";
import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import InstanceSettings from "./components/InstanceSettings";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingPage />,
    },

    {
      path: "/dashboard",
      element: <Dashboard />,
    },

    // {
    //   path: "/deploy",
    //   element: <Deploy />,
    // },

    {
      path: "/check-console",
      element: <ConsolePage />,
    },
    {
      path: "/vm",
      element: <VirtulMatchine />,
    },
    {
      path: "/donate",
      element: <Payment />,
    },
    {
      path: "/host",
      element: <HostPage />,
    },
    {
      path: "/settings",
      element: <InstanceSettings />,
    },
  ]);

  const { isLoading } = useLoading();
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 101 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <main>
        <RouterProvider router={router} />
      </main>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
