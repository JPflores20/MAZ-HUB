import { createRoot, hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";
import "./lib/i18n";

const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('The width(0) and height(0) of chart should be greater than 0')) {
    return;
  }
  originalWarn(...args);
};

const router = getRouter();
const rootElement = document.getElementById("root");

if (rootElement) {
  if (rootElement.children.length > 0) {
    hydrateRoot(rootElement, <RouterProvider router={router} />);
  } else {
    createRoot(rootElement).render(<RouterProvider router={router} />);
  }
}

// Unregister any stale or lingering Service Worker (e.g. Workbox) on local environment
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().catch(() => {});
    }
  });
}
