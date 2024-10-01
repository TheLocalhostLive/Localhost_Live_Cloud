import * as React from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { AiOutlineCheck } from "react-icons/ai"; // Correct import

export default function BasicChips() {
  return (
    <Stack direction="row" spacing={1}>
      <Chip
        label="Running Instances"
        icon={<AiOutlineCheck />}  // Add your icon here
        sx={{
          borderColor: "black",
          backgroundColor:"white", // Set border color to black
          color: "black", // Default text color
          display: "flex",
          alignItems: "center",
          gap: "5px",
          "&:hover": {
            backgroundColor: "black", // Change background to black on hover
            color: "white", // Change text color to white on hover
            borderColor: "black", // Ensure border stays black on hover
          },
        }}
      />
    </Stack>
  );
}
