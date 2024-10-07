import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "../style/virtual_machine.css";
import { Typography } from "@mui/material";

const VirtulMatchine = () => {
  const { state } = useLocation();
  const { container_name } = state || "";
  const [public_url, updatePublic_url] = useState("");
  const { user, getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    getAccessTokenSilently().then((accessToken) => {
      let owner = user?.nickname;
      if (!owner) {
        //alert("You Must Logging");
        return;
      }
      let payload = {
        owner,
        container_name,
      };

      axios
        .get(
          `${import.meta.env.VITE_BACKEND_URL}/launch/`,

          {
            params: { ...payload },
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          updatePublic_url(res.data.public_url);
        })
        .catch((error) => {
          console.error("Error fetching deployed projects", error);
        });
    });
  }, [user, container_name]); // Depend on container_name

  // Navigate to the public URL when it's updated
  useEffect(() => {
    if (public_url) {
      //console.log(public_url)
      //console.log(`https://${public_url}`)
      //window.location.href = "https://" + public_url; // Redirect to the public URL
    }
  }, [public_url]);

  return (
    <div>
      {/* You can add additional UI elements here if needed */}
      {!public_url && (
        <>
          <h1>Launching Virtual Machine...</h1>
          <h2> It May take some time</h2>
        </>
      )}
      <div className="virtual-machine-outer">
        <div id="app">
          <div id="wrapper">
            <h1
              class="glitch"
              data-text="ALPINE LINUX"
            >
              ALPINE LINUX
            </h1>
            <span class="sub">SSH TERMINAL</span>
          </div>
        </div>

        <div className="iframe-cont">
          {public_url && (
            <iframe
              src={`https://${public_url}`}
              height="800"
              width="1000"
              style={{ backgroundColor: 'black' }}
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtulMatchine;
