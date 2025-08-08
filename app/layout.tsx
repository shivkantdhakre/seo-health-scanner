'use client'; // This component needs to be a client component to use hooks.

import { useEffect } from "react";

// Metadata cannot be exported from a client component, so it's removed.
// We will set the title dynamically in the useEffect hook.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  useEffect(() => {
    // This effect runs on the client side to safely manipulate the <head>.
    
    // Set the document title
    document.title = "SEO Health Scanner";

    // --- Font & CSS Loading ---
    // We create and append link/script tags here to avoid rendering them directly in the component,
    // which was causing the nesting errors. We also check if they exist to prevent duplicates.

    if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
      const tailwindScript = document.createElement('script');
      tailwindScript.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(tailwindScript);
    }

    if (!document.querySelector('link[href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"]')) {
      const preconnect1 = document.createElement('link');
      preconnect1.rel = 'preconnect';
      preconnect1.href = 'https://fonts.googleapis.com';

      const preconnect2 = document.createElement('link');
      preconnect2.rel = 'preconnect';
      preconnect2.href = 'https://fonts.gstatic.com';
      preconnect2.crossOrigin = 'anonymous';

      const fontLink = document.createElement('link');
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap';
      fontLink.rel = 'stylesheet';

      document.head.appendChild(preconnect1);
      document.head.appendChild(preconnect2);
      document.head.appendChild(fontLink);
    }

    // --- Style Injection ---
    const styleElement = document.createElement('style');
    styleElement.id = 'custom-body-font-style'; // Give it a unique ID
    if (!document.getElementById(styleElement.id)) {
      styleElement.innerHTML = `
        body {
          font-family: 'Inter', sans-serif;
        }
      `;
      document.head.appendChild(styleElement);
    }

  }, []); // Empty dependency array ensures this effect runs only once on mount.

  return (
    // We return only the children, wrapped in a fragment. The rendering environment
    // provides the necessary <html> and <body> tags.
    <>
      {children}
    </>
  );
}
