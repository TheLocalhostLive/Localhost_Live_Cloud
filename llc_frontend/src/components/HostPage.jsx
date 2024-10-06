import React from "react";
import '../style/hostpage.css'
import { Button } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import Snackbar from "@mui/material/Snackbar";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import axios from "axios";
import CustomAppBar from "./ui_components/CustomAppBar";
import CopyToClipboardButton from "./ui_components/CopyToClipboardButton";
import { useLoading } from "../hook/useLoader";

const HostPage = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [url ,seturl]=useState(null);

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const {startLoading, stopLoading} =  useLoading();

  const handleGetpubUrlLlick = async ()=>{
    try {
      const container_name = document.getElementById("vm-name")
      const application_name = document.getElementById("app-name")
      const application_port = document.getElementById("app-port")
      const owner = user?.nickname;
      const payload ={
        owner: owner,
        container_name: container_name.value,
        application_name:application_name.value,
        application_port:application_port.value
      }
      console.log(payload);
      
      const accessToken = await getAccessTokenSilently();
      console.log(accessToken)
      startLoading();
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/host-project`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      
      if(res.status==200){
        console.log(res)
        setSnackbarMessage("Hosted Your Project!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        const URL = res.data.message;
        seturl(URL);
        stopLoading();

      }
  
       
      
        
      
    } catch (error) {
      setSnackbarMessage("Failed to Host");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      console.error("Error hosting the application", error);
      stopLoading();
    }


  }
  return (
    <>
    <CustomAppBar/>
      <div className="outer">
        <h1>Host Your Project</h1>

        <input
          id="vm-name"
          placeholder="Enter the Name of Your Virtual Machine"
          type="text"
          style={{ height: '40px', width: '300px' }}
        />

        <input
            id="app-name"
            placeholder="Enter the Name of Your Application"
            type="text"
            style={{ height: '40px', width: '300px' }}
        />
        <input
          id="app-port"
         placeholder="Enter Application Port Number"
         type="text" 
         style={{ height: '40px', width: '300px', marginTop: '10px' }}
        />
           <Button
            
            variant="outlined"
            onClick={handleGetpubUrlLlick}
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
          
           Get Public Url
          </Button>
          
           {
             url&&<CopyToClipboardButton text={url}/>
           }
          
           
          
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
};
export default HostPage;
