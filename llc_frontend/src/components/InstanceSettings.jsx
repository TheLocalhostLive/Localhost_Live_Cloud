import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import {
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Alert,
  Snackbar,
  Modal,
  Chip,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import CreateAppModal from "./ui_components/CreateAppModal";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useLoading } from "../hook/useLoader";

const drawerWidth = 240;

function ResponsiveDrawer() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const [menuContent, setMenuContent] = useState("general");

  function handleMenuContentChange(menuId) {
    return () => setMenuContent(menuId);
  }

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItem key={"General"} disablePadding>
          <ListItemButton onClick={handleMenuContentChange("general")}>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary={"General"} />
          </ListItemButton>
        </ListItem>

        <ListItem key={"Get Public URL"} disablePadding>
          <ListItemButton onClick={handleMenuContentChange("get_pub_url")}>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary={"Get Public URL"} />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            The Localhost Live
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      {menuContent === "general" && <GeneralSettingsContent />}
      {menuContent === "get_pub_url" && <PubURLSettingsContent />}
    </Box>
  );
}

function ChangePassModal({ open, handleClose, handleChangePassword }) {
  const [password, setPassword] = useState("");

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = () => {
    handleChangePassword(password);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="password-change-modal"
      aria-describedby="modal-for-password-change"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography id="password-change-modal" variant="h6" component="h2">
          Change Password
        </Typography>
        <TextField
          label="New Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={handlePasswordChange}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

function GeneralSettingsContent() {
  const { state } = useLocation();

  const { container_name } = state || "";
  const [isModalOpen, setModalOpen] = useState(false);
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const { getAccessTokenSilently, user } = useAuth0();
  const { startLoading, stopLoading } = useLoading();
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleChangePassword = async (newPassword) => {
    console.log(newPassword);
    if (newPassword.trim().length < 6) {
      setSnackbarMessage("Password Must be atleast 6 charecter long.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }
    try {
      startLoading();
      const token = await getAccessTokenSilently();
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/${user?.nickname}`,
        {
          container_name: container_name,
          new_password: newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackbarMessage("Password Changed successfully");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      console.log("Password changed successfully:", response.data);
    } catch (error) {
      console.error(
        "Error changing password:",
        error.response?.data || error.message
      );
      setSnackbarMessage("Failed to Host");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      stopLoading();
      handleCloseModal();
    }
  };
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        width: { sm: `calc(100% - ${drawerWidth}px)` },
      }}
    >
      <Toolbar />
      <Paper sx={{ p: 5 }}>
        <Typography variant="h5" sx={{ m: 2 }}>
          General
        </Typography>
        <TextField
          variant="outlined"
          label="Instance name"
          fullWidth
          value={container_name}
          disabled
          sx={{ marginBottom: "20px" }}
        />
        <Button
          onClick={handleOpenModal}
          sx={{ marginTop: "20px" }}
          variant="contained"
        >
          Change Password?
        </Button>
      </Paper>
      <ChangePassModal
        open={isModalOpen}
        handleClose={handleCloseModal}
        handleChangePassword={handleChangePassword}
      />

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
    </Box>
  );
}

function PubURLSettingsContent() {
  const { state } = useLocation();

  const { container_name } = state || "";
  const [pubUrls, setPubUrls] = useState([]);

  const { user, getAccessTokenSilently } = useAuth0();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [url, seturl] = useState(null);

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const [open, setOpen] = useState(false);
  function handleOpen() {
    setOpen(true);
  }
  function handleClose() {
    setOpen(false);
  }

  const { startLoading, stopLoading } = useLoading();

  const handleSubmit = async (name, port) => {
    try {
      const application_name = name;
      const application_port = port;
      const owner = user?.nickname;
      const payload = {
        owner: owner,
        container_name: container_name,
        application_name: application_name,
        application_port: application_port,
      };
      console.log(payload);

      const accessToken = await getAccessTokenSilently();
      console.log(accessToken);
      startLoading();
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/host-project`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status == 200) {
        console.log(res);
        setSnackbarMessage("Hosted Your Project!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        const URL = res.data.message;
        seturl(URL);
        stopLoading();
        setPubUrls((state) => [
          ...state,
          {
            application_name: name,
            application_port: port,
            public_url: URL,
          },
        ]);
      }
    } catch (error) {
      setSnackbarMessage("Failed to Host");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      console.error("Error hosting the application", error);
      stopLoading();
    } finally {
      handleClose();
    }
  };

  async function fetchApps() {
    const accessToken = await getAccessTokenSilently();
    console.log(accessToken);
    startLoading();
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/containers/${container_name}/applications`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPubUrls(res.data);
    } catch (err) {
      snackbarMessage("Something went wrong!!");
      snackbarSeverity("error");
      setOpenSnackbar(true);
      console.log(err);
    } finally {
      stopLoading();
    }
  }

  useEffect(() => {
    fetchApps();
  }, []);

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        width: { sm: `calc(100% - ${drawerWidth}px)` },
      }}
    >
      <Toolbar />
      <Paper sx={{ p: 5 }}>
        <Typography variant="h5" sx={{ m: 2 }}>
          Public URL
        </Typography>
        <Box
          sx={{ mb: "20px", display: "flex", justifyContent: "space-between" }}
        >
          <Typography>
            <Chip color="primary" label={`${container_name}`} />
          </Typography>
          <Button onClick={handleOpen} variant="contained">
            Expose Port
          </Button>
        </Box>
        <Box gap={3}>
          {pubUrls.map(
            ({
              application_name: name,
              application_port: port,
              public_url: publicURL,
            }) => (
              <Box key={name} gap={3} sx={{ display: "flex" }}>
                <TextField
                  variant="outlined"
                  label="Application name"
                  disabled
                  sx={{ marginBottom: "20px", flexGrow: 3 }}
                  value={name}
                />
                <TextField
                  sx={{ flexGrow: 1 }}
                  variant="outlined"
                  label="Port Number"
                  disabled
                  value={port}
                />
                <FormControl sx={{ m: 1, flexGrow: 3 }} variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-password">
                    Public URL
                  </InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-password"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton edge="end">
                          <ContentPasteIcon />
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Public URL"
                    value={publicURL}
                    disabled
                  />
                </FormControl>
                <Button>Edit</Button>
              </Box>
            )
          )}
          {pubUrls.length === 0 && (
            <Box>
              <Typography sx={{ width: "100%", textAlign: "center" }}>
                No ports exposed!
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
      {open && (
        <CreateAppModal handleClose={handleClose} handleSubmit={handleSubmit} />
      )}
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
    </Box>
  );
}

export default ResponsiveDrawer;
