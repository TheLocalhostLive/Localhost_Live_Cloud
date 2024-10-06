import ConsolePage from "./components/ConsolePage";
import Dashboard from "./components/Dashboard";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./components/LandingPage";

import Deploy from "./components/Deploy";
import VirtulMatchine from "./components/VirtulMatchine";
import  Payment  from "./components/Payment";
import { useLoading } from "./hook/useLoader";
import { Backdrop, CircularProgress } from "@mui/material";
import HostPage from './components/HostPage'

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

    {
      path: "/deploy",
      element: <Deploy />,
    },

    {
      path: "/check-console",
      element: <ConsolePage />,
    },
    {
      path: "/vm",
      element: <VirtulMatchine/>,
    },
    {
      path: "/donate",
      element: <Payment/>,
    },
    {
      path: "/host",
      element: <HostPage/>,
    },
  ]);

  const { isLoading } = useLoading();

  return (
    <div>
      <Backdrop
        sx={{ color: "#fff", zIndex: 100000 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
