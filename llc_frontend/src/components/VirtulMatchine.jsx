import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const VirtulMatchine = () => {
  const { state } = useLocation();
  const { container_name } = state || "";
  const [public_url, updatePublic_url] = useState("");
  const { user, getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    getAccessTokenSilently()
      .then((accessToken) => {
        let owner = user?.nickname;
        if (!owner) {
          alert("You Must Logging");
          return;
        }
        let payload = {
          owner,
          container_name,
        };

        axios
          .get(
            `http://localhost:8080/launch/`,

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
  }, [container_name]); // Depend on container_name

  // Navigate to the public URL when it's updated
  useEffect(() => {
    if (public_url) {
      //console.log(public_url)
      //console.log(`https://${public_url}`)
      window.location.href = "https://" + public_url; // Redirect to the public URL
    }
  }, [public_url]);

  return (
    <div>
      {/* You can add additional UI elements here if needed */}
      <h1>Launching Virtual Machine...</h1>
      <h2> It May take some time</h2>

      {/* {public_url&&
              
                
                <iframe src={`https://${public_url}`}
                    height={500}
                    width={500}
                >
                    </iframe>
            }                        */}
    </div>
  );
};

export default VirtulMatchine;
