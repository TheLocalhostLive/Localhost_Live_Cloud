import ConsolePage from "./components/ConsolePage"
import Dashboard from "./components/Dashboard"

import {createBrowserRouter,RouterProvider} from 'react-router-dom'

function App() {
  const router = createBrowserRouter([
    {
        path:"/",
        element:<Dashboard/>
    },{
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
