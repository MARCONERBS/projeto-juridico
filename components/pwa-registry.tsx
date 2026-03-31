"use client";

import { useEffect } from "react";

export function PwaRegistry() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker
          .register("/sw.js")
          .then(
            function (registration) {
              console.log("[PWA] Service Worker registration successful with scope: ", registration.scope);
            },
            function (err) {
              console.log("[PWA] Service Worker registration failed: ", err);
            }
          );
      });
    }
  }, []);

  return null;
}
