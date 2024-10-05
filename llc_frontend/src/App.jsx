import ConsolePage from "./components/ConsolePage";
import Dashboard from "./components/Dashboard";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./components/LandingPage";

import Deploy from "./components/Deploy";
import VirtulMatchine from "./components/VirtulMatchine";
import  Payment  from "./components/Payment";

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
  ]);

  return <RouterProvider router={router} />;
}

export default App;
