import { createClient } from "./auth";
import { APP_DATA } from "./common";

export default function RenderShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html data-theme="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Prevent flash of wrong theme by reading localStorage before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();`,
          }}
        />
        <link rel="stylesheet" href="/static/style.css" />
        <link rel="icon" href="/static/favicon.ico" />
        <title>{APP_DATA.projectName}</title>
      </head>
      <body id="root">
        <globalThis.AUTH.Provider value={createClient()}>
          {children}
        </globalThis.AUTH.Provider>
      </body>
    </html>
  );
}
