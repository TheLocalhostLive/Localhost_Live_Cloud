import * as React from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { AiOutlineCheck } from "react-icons/ai"; // Correct import

export default function BasicChips() {
  return (
    <Stack direction="row" spacing={1}>
      <Chip
        label="Running Apps"
        icon={<AiOutlineCheck />}  // Add your icon here
        sx={{
          backgroundColor: 'rgb(255,223,0)',
          color: 'black',  // Custom text color
          '&:hover': {
            backgroundColor: 'rgb(218, 165, 32)',  // Hover color
          },
        }}
      />
    </Stack>
  );
}
