import ConsolePage from "./components/ConsolePage"
import Dashboard from "./components/Dashboard"
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import LandingPage from "./components/LandingPage"
import { useAuth0 } from "@auth0/auth0-react";
import "./App.css";
import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Container,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";

function App() {
  const {
    isAuthenticated,
    getAccessTokenSilently,
    user,
    isLoading,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const settings = [
    { name: "Profile", callback: () => {console.log("profile")} },
    { name: "Dashboard", callback: () => {console.log("profile")} },
    {
      name: "Logout",
      callback: () => {
        logout({ logoutParams: { returnTo: window.location.origin } });
      },
    },
  ];
  const router = createBrowserRouter([
    {
        path:"/",
        element:<LandingPage/>
    },
    {
      path:"/dashboard",
      element:<Dashboard/>
      
    },
    {
      path:"/check-console",
        element:<ConsolePage/>
    }
  ]);
  const [accessToken, setAccessToken] = useState("");

  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = (cb) => {
    cb();
    setAnchorElUser(null);
  };

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        if (isAuthenticated) {
          console.log("isAuthenticated");
          const token = await getAccessTokenSilently({
            ignoreCache: true,
            audience: `https://dev-jfmhfrg7tmi1fr64.us.auth0.com/api/v2/`,
            redirect_uri: "http://localhost:5716/",
            scope: "openid profile email offline_access",

            detailedResponse: true,
          });
          console.log(user);
          console.log(token.access_token);
          console.log(accessToken);
          setAccessToken(token);
        } else {
          console.log("Not authenticated");
        }
      } catch (error) {
        console.error("Error fetching access token:", error);
      }
    };

    fetchAccessToken();
  }, [isAuthenticated, getAccessTokenSilently, user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <RouterProvider router={router}/>
      {/* AppBar */}
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
                <Typography sx={{ textAlign: "center" }}>{setting.name}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Banner */}
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: "url(https://source.unsplash.com/1600x900/?nature)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          style={{
            fontWeight: "bold",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
          }}
        >
          Welcome to LLC
        </Typography>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: "#f5f5f5",
          padding: "20px 0",
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body1">
            © 2024 MyApp. All Rights Reserved.
          </Typography>
        </Container>
      </Box>
    </div>
  );
}

export default App;
