// ClientWrapper is used client side only for state management
// you can create your own version of the routerHost

import { RouterHost } from "frame-master-plugin-apply-react/router";
import { StrictMode, useRef, type JSX } from "react";
import { createClient } from "./auth";

export default function ClientWrapper({ children }: { children: JSX.Element }) {
  const client = useRef(createClient()).current;

  return (
    <StrictMode>
      <globalThis.AUTH.Provider value={client}>
        <RouterHost>{children}</RouterHost>
      </globalThis.AUTH.Provider>
    </StrictMode>
  );
}
