
import { createRoot } from "react-dom/client";
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import 'pretendard/dist/web/static/pretendard.css';
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
  