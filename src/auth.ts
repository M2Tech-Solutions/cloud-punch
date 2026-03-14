import {
  createOpenAuthsterClient,
  OpenAuthsterClient,
} from "openauthster-shared/client/user";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type CommonSession = {
  role: "admin" | "employee";
};

export type PublicSession = {
  name: string;
  passkeyRegistered: boolean;
} & CommonSession;

export type PrivateSession = {
  workStartAt: string;
  salary?: number;
} & CommonSession;

export type ClientType = OpenAuthsterClient<PublicSession, PrivateSession>;

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
  var _CLIENT_: ClientType;
}

globalThis.AUTH ??= createContext<ClientType>(null as any);

export function createClient(props: {
  secret?: string;
  redirectURI: string;
  qrAuthFlowStartCallback?: () => Promise<boolean> | boolean;
}): ClientType {
  return createOpenAuthsterClient({
    clientID: "cloud_punch_m2",
    issuerURI:
      "https://92842b1c631342e8b8da135e4ee2ba75-auth-issuer.m2-tech.ca",
    redirectURI: props.redirectURI,
    secret: props?.secret,
    authFlowCallbacks: {
      onQRAuthFlowStart() {
        return props.qrAuthFlowStartCallback?.() ?? true;
      },
    },
  });
}

export function useAuth(): ClientType {
  const id = useRef(Math.random().toString(36).substring(2)).current;
  const [state, setState] = useState<string | null>(null);
  const client =
    typeof window == "undefined"
      ? ({} as ClientType)
      : useContext(globalThis.AUTH);

  useEffect(() => {
    client.addInitializationListener(id, () => {
      setState(Math.random().toString(36).substring(2));
    });
    return () => {
      client.removeInitializationListener(id);
    };
  }, []);

  return client;
}

export function createActionFetcher(client: ClientType) {
  globalThis._CLIENT_ ??= client;
}
