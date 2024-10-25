import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";

const CreateInstancePopup = ({
  handleClose,
  instanceName,
  setInstanceName,
  handleCreate,
  password,
  setPassword,
}) => {
  const { user } = useAuth0();
  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create Instance</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Instance Name"
            type="text"
            fullWidth
            helperText="My Linux"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
          />
          <TextField
            autoFocus
            margin="dense"
            label="choose password"
            type="password"
            fullWidth
            helperText="pass@123"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Typography>{`${user?.nickname}-${instanceName}`}</Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CreateInstancePopup;
