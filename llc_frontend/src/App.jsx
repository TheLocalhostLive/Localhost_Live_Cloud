import ConsolePage from "./components/ConsolePage";
import Dashboard from "./components/Dashboard";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./components/LandingPage";

import Deploy from "./components/Deploy";
import VirtulMatchine from "./components/VirtulMatchine";

function App() {
  const router = createBrowserRouter([
    // {
    //   path: "/",
    //   element: <LandingPage />,
    // },

    {
      path: "/",
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
  ]);

  return <RouterProvider router={router} />;
}

export default App;
