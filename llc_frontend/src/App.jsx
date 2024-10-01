import ConsolePage from "./components/ConsolePage";
import Dashboard from "./components/Dashboard";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./components/LandingPage";

import Deploy from "./components/Deploy";

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
  ]);

  return <RouterProvider router={router} />;
}

export default App;
