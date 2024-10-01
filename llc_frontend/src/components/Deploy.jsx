import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CustomAppBar from "./ui_components/CustomAppBar";
import { Button, TextField } from "@mui/material";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid2";
import { Typography } from "@mui/material";
import SearchBar from "./ui_components/SearchBar";
import RepoList from "./ui_components/RepoList";
import { useAuth0 } from "@auth0/auth0-react";
import { useForm, useFieldArray } from "react-hook-form";
import SelectTech from "./ui_components/SelectTech";

function CenteredTabs({ value, setValue }) {
  const handleChange = (event, newValue) => {
    console.log(newValue);

    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
      <Tabs value={value} onChange={handleChange} centered>
        <Tab label="Project Details" />
        <Tab label="Project Settings" />
      </Tabs>
    </Box>
  );
}

function ProjectDetails() {
  const [repos, setRepos] = useState([
    "ChatApp",
    "Rust App",
    "NodeApp",
    "Spring App",
  ]);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  async function fetchGithubRepos(username) {
    if (!isAuthenticated) {
      return;
    }

    const apiUrl = `https://api.github.com/users/${username}/repos`;

    try {
      const { access_token, id_token } = await getAccessTokenSilently({
        ignoreCache: true,
        audience: `https://dev-jfmhfrg7tmi1fr64.us.auth0.com/api/v2/`,
        redirect_uri: "http://localhost:5716/",
        scope: "openid profile email offline_access",

        detailedResponse: true,
      });
      console.log(access_token);
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${id_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const repos = await response.json();
      return repos.map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
      }));
    } catch (error) {
      console.error("Failed to fetch GitHub repositories:", error);
      return [];
    }
  }
  const { user } = useAuth0();
  useEffect(() => {
    if (!user) return;
    console.log(user.nickname);
    fetchGithubRepos(user.nickname)
      .then((repos) => {
        console.log("Repositories:", repos);
        setRepos(repos);
      })
      .catch((error) => {
        console.error("Error:", error);
        setRepos(["ChatApp", "Rust App", "NodeApp", "Spring App"]);
      });
  }, [user]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh", // Vertically centers the content
        backgroundColor: "#121212", // Dark background color
      }}
    >
      <Paper
        elevation={3} // Adds shadow to the Paper
        sx={{
          padding: 4, // Adds padding inside the Paper
          maxWidth: 800, // Limits the Paper width
          width: "100%", // Ensures it doesn't overflow
          backgroundColor: "#1e1e1e", // Darker background for the Paper
          color: "#fff", // White text color for dark background
        }}
      >
        <Grid container spacing={2}>
          <Grid item size={12}>
            <Typography variant="h5" align="center" sx={{ color: "#fff" }}>
              Import Github Repository
            </Typography>
          </Grid>

          <Grid size={6}>
            <Typography align="center" sx={{ color: "#bbb" }}>
              {user?.nickname}
            </Typography>
          </Grid>
          <Grid size={6}>
            <SearchBar />
          </Grid>

          <Grid item size={12}>
            {repos.map((repo, index) => (
              <RepoList repo={repo} key={index} />
            ))}
          </Grid>
          <Grid item size={12}>
            <SelectTech />
          </Grid>
          <Grid item size={12}>
            <TextField
              fullWidth
              style={{ background: "white" }}
              required
              id="outlined-required"
              label="Start script"
              placeholder="eg. npm start"
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

function ProjectSettings() {
  
  const {getAccessTokenSilently} = useAuth0();

  const { control, register, handleSubmit } = useForm({
    defaultValues: {
      envVars: [{ key: "", value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "envVars",
  });

  const onSubmit = async(data) => {
    const access_token = await getAccessTokenSilently();
    console.log(data);
    console.log(access_token);
    fetch("http://localhost:8080/deploy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify(data)
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#121212", // Dark background
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 800,
          width: "100%",
          backgroundColor: "#1e1e1e", // Darker background for the Paper
          color: "#fff",
        }}
      >
        <Typography variant="h5" sx={{ color: "#fff", mb: 4 }}>
          Set Environment Variables
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          {fields.map((field, index) => (
            <Grid container spacing={2} key={field.id}>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Key"
                  variant="outlined"
                  {...register(`envVars.${index}.key`)}
                  sx={{
                    input: { color: "#fff" },
                    label: { color: "#aaa" },
                    backgroundColor: "#2c2c2c", // Input background for dark theme
                  }}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Value"
                  variant="outlined"
                  {...register(`envVars.${index}.value`)}
                  sx={{
                    input: { color: "#fff" },
                    label: { color: "#aaa" },
                    backgroundColor: "#2c2c2c", // Input background for dark theme
                  }}
                />
              </Grid>
              <Grid item xs={2} sx={{ display: "flex", alignItems: "center" }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          ))}

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item size={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => append({ key: "", value: "" })}
              >
                Add Variable
              </Button>
            </Grid>
            <Grid item size={12} sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" color="success">
                Save
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

const Deploy = () => {
  const [value, setValue] = React.useState(0);
  return (
    <div>
      <CustomAppBar />
      <CenteredTabs value={value} setValue={setValue} />
      {value == 0 ? <ProjectDetails /> : <ProjectSettings />}
    </div>
  );
};

export default Deploy;
