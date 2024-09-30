import React,{useState} from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CustomAppBar from "./ui_components/CustomAppBar";

import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid2";
import { Typography } from "@mui/material";
import SearchBar from "./ui_components/SearchBar";


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
    const [repos,setRepos] = useState(["ChatApp","Rust App","NodeApp","Spring App"])
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
               <Typography>
                    Import Github Repository
               </Typography>
          </Grid>
          <Grid size={6}>
               <Typography>
                    Github Account
               </Typography>
          </Grid>
          <Grid size={6}>
               <SearchBar/>
          </Grid>
          {
            repos.map((vaue)=>{
                return <Grid size={12}>
                    {vaue}
                </Grid>
            })
          }
        </Grid>
      </Box>
    </>
  );
}
function ProjectSettings() {
  return <>Env Setup</>;
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
