import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";
import { LoadingProvider } from "./context/LoadingContext";

const root = createRoot(document.getElementById("root"));

root.render(
  <Auth0Provider
    domain="dev-jfmhfrg7tmi1fr64.us.auth0.com"
    clientId="vJGp34ovHLa67f3c7VGVDHHl6LYgKbai"
    useRefreshTokens={true}
    cacheLocation="localstorage"
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "https://dev-jfmhfrg7tmi1fr64.us.auth0.com/api/v2/",
      scope: "openid profile email offline_access",
    }}
  >
    <LoadingProvider>
      <App />
    </LoadingProvider>
  </Auth0Provider>
);
