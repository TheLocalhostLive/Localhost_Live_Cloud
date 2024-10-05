import React, { useEffect, useState } from "react";
import "../style/dashboard.css";
import { AiOutlinePlus, AiFillExclamationCircle, AiFillCode, AiFillHeart } from "react-icons/ai";
import axios from "axios";
import Button from "@mui/joy/Button";
import { useNavigate } from "react-router-dom";
import BasicChips from "./ui_components/BasicChips";
import CreateInstancePopup from "./CreateInstancePopup";
import { useAuth0 } from "@auth0/auth0-react";
import CustomAppBar from "./ui_components/CustomAppBar";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import PaymentPage from "./PaymentPage";
import HostPage from "./HostPage";

function Dashboard() {
  const [DeployedList, updateDeployedList] = useState([]);
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useAuth0();
  const [accessToken, setAccessToken] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useState(() => {
    getAccessTokenSilently().then((token) => setAccessToken(token));
  }, []);

  useEffect(() => {
    if (!accessToken) {
      console.log("Access Token is missing");
      return;
    }
    let owner = user?.nickname;
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

  const handleLaunchClick = (id, container_name) => {
    navigate(`/vm`, { state: { container_name } });
  };

  function handleTerminateClick(container_name) {
    let owner = user?.nickname;
    axios
      .delete(`http://127.0.0.1:8080/delete`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: {
          owner: owner,
          container_name: container_name,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setSnackbarMessage("Terminated Successfully!");
          setSnackbarSeverity("success");
          setOpenSnackbar(true);
          // Optionally remove the terminated container from the list
          updateDeployedList((prev) =>
            prev.filter((item) => item.container_name !== container_name)
          );
        }
      })
      .catch((error) => {
        setSnackbarMessage("Failed to Terminate!");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        console.error("Error terminating the container", error);
      });
  }

  const handleDepoyProjectClick = () => {
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
      const deployRes = await axios.post(
        "http://127.0.0.1:8080/deploy",
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
      updateDeployedList((state) => [...state, deployRes.data]);
      handleClose();
    } catch (error) {
      console.error("Error creating instance:", error);
    }
  };
  function handleHostProjectClick() {
    navigate('/host-project')
  }

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };
  const handleDontateCLick =()=>{
    navigate('/donate')
  }


  return (
    <>
      <CustomAppBar />
      <div className="top-container">
        <h1 className="top-container-h1">Dashboard</h1>
        <div className="top-container-div">
          <Button
            onClick={handleOpen}
            variant="outlined"
            sx={{
              backgroundColor: "white",
              borderColor: "black",
              color: "black",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              "&:hover": {
                backgroundColor: "black",
                color: "white",
                borderColor: "black",
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
              backgroundColor: "white",
              borderColor: "black",
              color: "black",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              "&:hover": {
                backgroundColor: "black",
                color: "white",
                borderColor: "black",
              },
            }}
          >
            <AiOutlinePlus />
            Deploy Project
          </Button>
          <Button
            color="warning"
            onClick={handleHostProjectClick}
            variant="outlined"
            sx={{
              backgroundColor: "white",
              borderColor: "black",
              color: "black",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              "&:hover": {
                backgroundColor: "black",
                color: "white",
                borderColor: "black",
              },
            }}
          >
            <AiOutlinePlus />
            Host Your Project
          </Button>
          
          <Button
            color="warning"
            onClick={handleDontateCLick}
            variant="outlined"
            sx={{
              backgroundColor: "white",
              borderColor: "black",
              color: "black",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              "&:hover": {
                backgroundColor: "black",
                color: "white",
                borderColor: "black",
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

              <div className="deployed-item-inner">
                <Button
                  onClick={() => handleTerminateClick(container_name)}
                  variant="outlined"
                  sx={{
                    borderColor: "black",
                    color: "black",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    "&:hover": {
                      backgroundColor: "black",
                      color: "white",
                      borderColor: "black",
                    },
                  }}
                >
                  <AiFillExclamationCircle />
                  Terminate
                </Button>

                <Button
                  onClick={() => handleLaunchClick(_id, container_name)}
                  variant="outlined"
                  sx={{
                    borderColor: "black",
                    color: "black",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    "&:hover": {
                      backgroundColor: "black",
                      color: "white",
                      borderColor: "black",
                    },
                  }}
                >
                  <AiFillCode />
                  Launch
                </Button>
              </div>
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

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Dashboard;
