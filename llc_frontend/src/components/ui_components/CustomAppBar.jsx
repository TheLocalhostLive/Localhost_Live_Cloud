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
} from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function CustomAppBar() {
  const {
    user,
    loginWithRedirect,
    logout,
  } = useAuth0();
  const navigate = useNavigate()
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
        navigate("/dashboard")
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
    cb();
    setAnchorElUser(null);
  };
  return (
    <AppBar position="static" style={{ backgroundColor: "#3f51b5" }}>
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          MyApp
        </Typography>
        {!user ? (
          <Button
            color="inherit"
            variant="outlined"
            onClick={loginWithRedirect}
          >
            Sign Up
          </Button>
        ) : (
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar alt="Remy Sharp" src={`${user.picture}`} />
          </IconButton>
        )}
        <Menu
          sx={{ mt: "45px" }}
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
          onClose={handleCloseUserMenu}
        >
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
