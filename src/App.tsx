import './App.css'
import {AuthProvider} from "./core/context/AuthProvider.tsx";
import {RouterProvider} from "react-router-dom";
import router from "./router";

function App() {
  return (
    <>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </>
  )
}

export default App
