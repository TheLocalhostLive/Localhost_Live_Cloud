import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useRef } from "react";

const CreateInstancePopup = ({ handleClose, handleSubmit }) => {
  const appNameInputRef = useRef();
  const porNumInputRef = useRef();

  function submitHelper() {
    
    const app = appNameInputRef.current.value;
    const port = porNumInputRef.current.value;

    handleSubmit(app, port);
  }
  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create App Modal</DialogTitle>
        <DialogContent>
          <TextField
            inputRef={appNameInputRef}
            autoFocus
            margin="dense"
            label="App Name"
            type="text"
            fullWidth
          />
          <TextField
            inputRef={porNumInputRef}
            autoFocus
            margin="dense"
            label="Port Number"
            fullWidth
            helperText="eg. 3000"
            type="number"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={submitHelper}>
            Get Public URL
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CreateInstancePopup;
