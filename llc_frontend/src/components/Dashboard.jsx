import React, { useEffect, useState } from "react";
import "../style/dashboard.css";
import { AiOutlinePlus, AiOutlineCheck, AiOutlineCode } from "react-icons/ai";
import axios from "axios";
import Button from "@mui/joy/Button";

import { AiFillHeart } from "react-icons/ai";

import { useNavigate } from "react-router-dom";
import BasicChips from "./ui_components/BasicChips";
import CreateInstancePopup from "./CreateInstancePopup";
import { useAuth0 } from "@auth0/auth0-react";
import CustomAppBar from "./ui_components/CustomAppBar";

function Dashboard() {
  const [DeployedList, updateDeployedList] = useState([]);
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useAuth0();

  const [accessToken, setAccessToken] = useState(null);

  useState(() => {
    getAccessTokenSilently().then((token) => setAccessToken(token));
  }, []);

  useEffect(() => {
    if (!accessToken) {
      console.log("Access Token is missing");
      return;
    } else {
      console.log(accessToken);
    }
    let  owner = user?.nickname;
    console.log(owner)
    axios
      .get(`http://127.0.0.1:8080/deploy/${owner}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        updateDeployedList(res.data);
      })
      .catch((error) => {
        console.error("Error fetching deployed projects", error);
      });
  }, [accessToken]);

  const handleCheckConsoleClick = (id, container_name) => {
    // console.log(`Card with ID ${id} clicked`);
    // console.log(container_name)
    navigate(`/vm`, { state: { container_name } });
  };
  const handleDepoyProjectClick = () => {
    // console.log(`Card with ID ${id} clicked`);
    // console.log(container_name)
    navigate(`/deploy`);
  };

  const [open, setOpen] = useState(false);
  const [instanceName, setInstanceName] = useState("");
  const [appName, setAppName] = useState("");

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreate = async () => {
    try {
      const access_token = await getAccessTokenSilently();
      console.log(access_token);
  
      const deployRes = await axios.post(
        "http://127.0.0.1:8080/deploy", // Fix spelling of "deploy"
        {
          owner: user?.nickname,
          container_name: `${user?.nickname}-${instanceName}`,
          application_name: appName,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log(deployRes);
      updateDeployedList((state) => [...state, deployRes.data]); // Use deployRes.data to get the response data
      handleClose();
    } catch (error) {
      console.error("Error creating instance:", error); // Log the error
    }
  };
  

  return (
    <>
      <CustomAppBar/>
      <div className="top-container">
        <h1 className="top-container-h1">Dashboard</h1>
        <div className="top-container-div">
          <Button
            onClick={handleOpen}
            variant="outlined" // Use 'outlined' to have a border
            sx={{
              backgroundColor: "white", // Set the default background color to white
              borderColor: "black", // Set border color to black
              color: "black", // Set default text color to black
              display: "flex",
              alignItems: "center",
              gap: "5px",
              "&:hover": {
                backgroundColor: "black", // Change background to black on hover
                color: "white", // Change text color to white on hover
                borderColor: "black", // Ensure border stays black on hover
              },
            }}
          >
            <AiOutlinePlus />
            Create Instance
          </Button>
          <Button
            color="warning"
            onClick={handleDepoyProjectClick}
            variant="outlined"
            sx={{
              backgroundColor: "white", // Set the default background color to white
              borderColor: "black", // Set border color to black
              color: "black", // Set default text color to black
              display: "flex",
              alignItems: "center",
              gap: "5px",
              "&:hover": {
                backgroundColor: "black", // Change background to black on hover
                color: "white", // Change text color to white on hover
                borderColor: "black", // Ensure border stays black on hover
              },
            }}
          >
            <AiOutlinePlus />
            Deploy Project
          </Button>
          <Button
            color="warning"
            onClick={function () {}}
            variant="outlined"
            sx={{
              backgroundColor: "white", // Set the default background color to white
              borderColor: "black", // Set border color to black
              color: "black", // Set default text color to black
              display: "flex",
              alignItems: "center",
              gap: "5px",
              "&:hover": {
                backgroundColor: "black", // Change background to black on hover
                color: "white", // Change text color to white on hover
                borderColor: "black", // Ensure border stays black on hover
              },
            }}
          >
            <AiFillHeart />
            Donate
          </Button>
        </div>
      </div>

      <div className="container-outer">
        <BasicChips />
      </div>

      <div className="deployed-list-container">
        {DeployedList.map((post) => {
          const { _id, application_name, container_name, tech } = post;
          return (
            <div key={_id} className="deployed-item">
              <div>
                <h2>{application_name}</h2>
                <h3>{tech}</h3>
              </div>

              <Button
                onClick={() =>handleCheckConsoleClick(_id, container_name)}
                variant="outlined" // Use 'outlined' for a transparent background
                sx={{
                  borderColor: "black", // Set border color to black
                  color: "black", // Default text color
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  "&:hover": {
                    backgroundColor: "black", // Change background to black on hover
                    color: "white", // Change text color to white on hover
                    borderColor: "black", // Ensure border stays black on hover
                  },
                }}
              >
                <AiOutlineCode />
                Launch
              </Button>
            </div>
          );
        })}
        {open && (
          <CreateInstancePopup
            handleOpen={handleOpen}
            handleClose={handleClose}
            instanceName={instanceName}
            setInstanceName={setInstanceName}
            handleCreate={handleCreate}
            appName={appName}
            setAppName={setAppName}
          />
        )}
      </div>
    </>
  );
}

export default Dashboard;
