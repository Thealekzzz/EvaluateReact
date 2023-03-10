import { createBrowserRouter, RouterProvider } from "react-router-dom";

import './App.css';
import Main from './pages/Main/Main.js';
import Evaluate from './pages/Evaluate/Evaluate.js';
import Login from "./pages/Login/Login";
import Registration from "./pages/Registration/Registration";
import HowItWorks from "./pages/HowItWorks/HowItWorks";
import CreateEvaluateRequest from "./pages/CreateEvaluateRequest/CreateEvaluateRequest";

function App() {
  const router = createBrowserRouter([
    { path: "/", element: <Main /> }, 
    { path: "/evaluate", element: <Evaluate /> },
    { path: "/login", element: <Login /> },
    { path: "/registration", element: <Registration /> },
    { path: "/howitworks", element: <HowItWorks /> },
    { path: "/createrequest", element: <CreateEvaluateRequest /> },
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
