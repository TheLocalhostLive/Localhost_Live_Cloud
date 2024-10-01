import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CssBaseline,
  Typography,
} from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const CreateInstancePopup = ({
  handleClose,
  instanceName,
  setInstanceName,
  handleCreate,
  appName,
  setAppName
}) => {
  const { user } = useAuth0();
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create Instance</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Instance Name"
            type="text"
            fullWidth
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
          />
          <Typography>{`${user?.nickname}-${instanceName}`}</Typography>
        </DialogContent>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Application Name"
            type="text"
            fullWidth
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
          />
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default CreateInstancePopup;
