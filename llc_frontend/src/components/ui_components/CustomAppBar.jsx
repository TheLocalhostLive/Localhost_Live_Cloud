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
          id="menu-appbar"
          anchorEl={anchorElUser}
          keepMounted
          open={Boolean(anchorElUser)}
          onClose={() => handleCloseUserMenu()}
        >
          {/* Close Button */}
          <MenuItem  sx={{justifyContent: "flex-end"}}>
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
