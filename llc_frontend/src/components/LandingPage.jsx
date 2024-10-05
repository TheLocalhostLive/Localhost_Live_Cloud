import { useEffect, useState } from "react";
import "../style/landing_page.css";
import { useAuth0 } from "@auth0/auth0-react";
import CustomAppBar from "./ui_components/CustomAppBar";
import BlackHoleModel from "./BlackHoleModel";

const LandingPage = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [accessToken, setAccessToken] = useState("");
  const { isAuthenticated, getAccessTokenSilently, user, isLoading } =
    useAuth0();
  const phrases = ["LLC...", "Localhost Live Cloud"];
  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        if (isAuthenticated) {
          console.log("isAuthenticated");
          const token = await getAccessTokenSilently({
            ignoreCache: true,
            audience: `https://dev-jfmhfrg7tmi1fr64.us.auth0.com/api/v2/`,
            redirect_uri: "http://localhost:5716/",
            scope: "openid profile email offline_access",

            detailedResponse: true,
          });
          console.log(user);
          console.log(token.access_token);
          console.log(accessToken);
          setAccessToken(token);
        } else {
          console.log("Not authenticated");
        }
      } catch (error) {
        console.error("Error fetching access token:", error);
      }
    };

    fetchAccessToken();
  }, [isAuthenticated, getAccessTokenSilently, user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 3000); // Change every 6 seconds (should match your animation duration)

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <CustomAppBar />
      <div className="outer">
        <BlackHoleModel />
        <h1 className="main-text scroll-up-animate" data-text={phrases[currentPhrase]}>{phrases[currentPhrase]}</h1>
      </div>
    </>
  );
};

export default LandingPage;
