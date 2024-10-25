import { useEffect, useState } from "react";
import "../style/dashboard.css";
import { AiOutlinePlus, AiFillHeart } from "react-icons/ai";
import axios from "axios";
import Button from "@mui/joy/Button";
import { useNavigate } from "react-router-dom";
import BasicChips from "./ui_components/BasicChips";
import CreateInstancePopup from "./CreateInstancePopup";
import { useAuth0 } from "@auth0/auth0-react";
import CustomAppBar from "./ui_components/CustomAppBar";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useLoading } from "../hook/useLoader";
import InstanceCard from "./ui_components/InstanceCard";

function Dashboard() {
  const [DeployedList, updateDeployedList] = useState([]);
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useAuth0();
  const [accessToken, setAccessToken] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const { startLoading, stopLoading } = useLoading();

  useState(() => {
    getAccessTokenSilently().then((token) => setAccessToken(token));
  }, []);

  useEffect(() => {
    startLoading();
    if (!accessToken) {
      console.log("Access Token is missing");
      return;
    }
    let owner = user?.nickname;
    console.log(owner);
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/deploy/${owner}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        updateDeployedList(res.data);
        stopLoading();
      })
      .catch((error) => {
        console.error("Error fetching deployed projects", error);
        stopLoading();
      });
  }, [accessToken]);

  const handleLaunchClick = (id, container_name) => {
    navigate(`/vm`, { state: { container_name } });
  };

  function handleTerminateClick(container_name) {
    startLoading();

    let owner = user?.nickname;
    axios
      .delete(`${import.meta.env.VITE_BACKEND_URL}/delete`, {
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

    stopLoading();
  }

  // const handleDepoyProjectClick = () => {
  //   navigate(`/deploy`);
  // };

  const [open, setOpen] = useState(false);
  const [instanceName, setInstanceName] = useState("");
  const [password, setPassword] = useState("");
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
      startLoading();
      const deployRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/deploy`,
        {
          owner: user?.nickname,
          container_name: `${user?.nickname}-${instanceName}`,
          password: password,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(deployRes);
      updateDeployedList((state) => [...state, deployRes.data]); // Use deployRes.data to get the response data
      handleClose();
    } catch (error) {
      console.error("Error creating instance:", error);
    } finally {
      stopLoading();
    }
  };
  function handleHostProjectClick() {
    navigate("/host");
  }

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };
  const handleDontateCLick = () => {
    navigate("/donate");
  };

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
          {/*<Button
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
          </Button>*/}
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
        {DeployedList.map(({ _id, container_name, tech }) => (
          <InstanceCard
            _id={_id}
            key={_id}
            container_name={container_name}
            tech={tech}
            handleTerminateClick={handleTerminateClick}
            handleLaunchClick={handleLaunchClick}
          />
        ))}
        {open && (
          <CreateInstancePopup
            handleOpen={handleOpen}
            handleClose={handleClose}
            instanceName={instanceName}
            setInstanceName={setInstanceName}
            password={password}
            setPassword={setPassword}
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
