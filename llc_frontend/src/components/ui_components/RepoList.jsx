
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import { FaGithub } from "react-icons/fa";


// Styled component for the list background
const Demo = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: "black",
}));

// Update RepoList to accept props
export default function RepoList({ repo: {name, description} }) {

  return (
    <Box sx={{ flexGrow: 1, width: "100%" }}>
      <Grid container spacing={2}>
        <Grid item size={12}>
          <Demo>
            <List dense={true}>
              <ListItem
                secondaryAction={
                  <Button variant="contained" color="primary">
                    Import
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                  <FaGithub />
                  </Avatar>
                </ListItemAvatar>
                {/* Dynamically render the repoName passed as a prop */}
                <ListItemText
                  primary={name}
                  secondary={description}
                />
              </ListItem>
            </List>
          </Demo>
        </Grid>
      </Grid>
    </Box>
  );
}
