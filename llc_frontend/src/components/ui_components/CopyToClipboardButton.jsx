import React, { useState } from "react";
import { TextField, IconButton, Snackbar, Box } from "@mui/material";
import CopyIcon from '@mui/icons-material/ContentCopy';

const CopyToClipboardButton = ({ text }) => {
  const [open, setOpen] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text); // Copy the input text to clipboard
      setOpen(true); // Show Snackbar indicating success
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={2}>
        {/* TextField with a white background */}
        <TextField
          variant="outlined"
          value={text} // Text from props
          fullWidth
          disabled={true} // Disable to make the field non-editable
          sx={{
            backgroundColor: "#fff", // White background
          }}
        />

        {/* IconButton to trigger the copy to clipboard */}
        <IconButton onClick={handleClick} color="primary" aria-label="Copy to clipboard">
          <CopyIcon/>
        </IconButton>
      </Box>

      {/* Snackbar to show feedback after copying */}
      <Snackbar
        message="Copied to clipboard"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={2000}
        onClose={() => setOpen(false)}
        open={open}
      />
    </>
  );
};

export default CopyToClipboardButton;
