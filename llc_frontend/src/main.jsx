import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";

const root = createRoot(document.getElementById("root"));

root.render(
  <Auth0Provider
    domain="dev-4rcvkns3pn1y2ety.us.auth0.com"
    clientId="tFNevsQ6dGd2pVEG5GO4rTVpK0aYHUGR"
    useRefreshTokens={true}
    cacheLocation="localstorage"
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "https://dev-4rcvkns3pn1y2ety.us.auth0.com/api/v2/",
      scope: "openid profile email offline_access",
    }}
  >
    <App />
  </Auth0Provider>
);
