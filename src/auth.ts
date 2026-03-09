import {
  createOpenAuthsterClient,
  OpenAuthsterClient,
} from "openauthster-shared/client/user";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type PublicSession = {
  name: string;
  passkeyRegistered: boolean;
};

type PrivateSession = {
  workStartAt: string;
};

declare global {
  var AUTH: React.Context<
    OpenAuthsterClient<
      PublicSession,
      PrivateSession,
      {
        provider: string;
      }
    >
  >;
}

globalThis.AUTH ??= createContext<
  OpenAuthsterClient<PublicSession, PrivateSession>
>(null as any);

export function createClient(props?: {
  secret?: string;
}): OpenAuthsterClient<PublicSession, PrivateSession> {
  return createOpenAuthsterClient({
    clientID: "cloud_punch_m2",
    issuerURI:
      "https://92842b1c631342e8b8da135e4ee2ba75-auth-issuer.m2-tech.ca",
    redirectURI: "http://localhost:3001",
    secret: props?.secret,
  });
}

export function useAuth(): OpenAuthsterClient<PublicSession, PrivateSession> {
  const id = useRef(Math.random().toString(36).substring(2)).current;
  const [state, setState] = useState<string | null>(null);
  const client =
    typeof window == "undefined"
      ? ({} as OpenAuthsterClient<PublicSession, PrivateSession>)
      : useContext(globalThis.AUTH);

  useEffect(() => {
    client.addInitializationListener(id, () => {
      setState(Math.random().toString(36).substring(2));
    });
    return () => {
      //client.removeInitializationListener(id);
    };
  }, []);

  return client;
}
