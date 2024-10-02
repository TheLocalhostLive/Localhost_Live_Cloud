import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close'; // Import the CloseIcon
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function CustomAppBar() {
  const { user, loginWithRedirect, logout } = useAuth0();
  const navigate = useNavigate();
  const settings = [
    {
      name: "Profile",
      callback: () => {
        console.log("profile");
      },
    },
    {
      name: "Dashboard",
      callback: () => {
        navigate("/dashboard");
      },
    },
    {
      name: "Logout",
      callback: () => {
        logout({ logoutParams: { returnTo: window.location.origin } });
      },
    },
  ];

  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = (cb) => {
    if (cb) cb();
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static" sx={{ 
      background: "linear-gradient(-20deg, grey, black)",
      }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Localhost Live Cloud
        </Typography>
        {!user ? (
          <Button color="inherit" variant="outlined" onClick={loginWithRedirect}>
            Sign Up
          </Button>
        ) : (
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar alt="Remy Sharp" src={`${user.picture}`} />
          </IconButton>
        )}
        <Menu
          sx={{
            mt: "45px",
            "& .MuiPaper-root": {
              borderRadius: "12px", // Rounded corners
              boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)", // Subtle shadow
              padding: "10px",
              backgroundColor: "#fff", // White background
              transition: "all 0.3s ease-in-out", // Smooth transition
            },
            "& .MuiMenuItem-root": {
              borderRadius: "8px", // Rounded items
              transition: "background 0.3s ease", // Smooth hover effect
              "&:hover": {
                backgroundColor: "#f0f0f0", // Hover effect
                transform: "scale(1.02)", // Slight scaling
              },
            },
          }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorElUser)}
          onClose={() => handleCloseUserMenu()}
        >
          {/* Close Button */}
          <MenuItem disableGutters sx={{ justifyContent: "flex-end" }}>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => handleCloseUserMenu()}
            >
              <CloseIcon />
            </IconButton>
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          {settings.map((setting) => (
            <MenuItem
              id={setting.name}
              key={setting.name}
              onClick={() => handleCloseUserMenu(setting.callback)}
              sx={{
                fontWeight: "500", // Slightly bold text
                padding: "10px 20px", // Spacing for better UI
                "&:not(:last-child)": {
                  mb: 1, // Margin between menu items
                },
              }}
            >
              <Typography sx={{ textAlign: "center" }}>
                {setting.name}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
