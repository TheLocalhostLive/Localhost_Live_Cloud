import ConsolePage from "./components/ConsolePage"
import Dashboard from "./components/Dashboard"

import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import LandingPage from "./components/LandingPage"

function App() {
  const router = createBrowserRouter([
    {
        path:"/",
        element:<LandingPage/>
    },
    {
      path:"/dashboard",
      element:<Dashboard/>
      
    },
    {
      path:"/check-console",
        element:<ConsolePage/>
    }
  ])

  return (
    <>
     <RouterProvider router={router}/>
    </>
  )
}

export default App
