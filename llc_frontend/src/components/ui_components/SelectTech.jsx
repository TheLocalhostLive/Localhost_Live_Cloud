import { useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function SelectTech() {
  const [selectedTech, setSelectedTech] = useState("");

  const handleChange = (event) => {
    setSelectedTech(event.target.value);
  };

  const techs = ["Select Tech", "React", "Next.js", "Node.js", "Rust"];

  return (
    <div>
      <FormControl sx={{ width: "100%", background: "#fff" }}>
        <InputLabel id="tech-select-label">Tech</InputLabel>
        <Select
          labelId="tech-select-label"
          id="tech-select"
          value={selectedTech}
          onChange={handleChange}
          label="Tech"
          fullWidth
          MenuProps={{
            PaperProps: {
              sx: {
                width: 'auto', // Allow the menu to resize to fit content
                maxWidth: '100%', // Ensure it does not exceed the parent width
              },
            },
          }}
        >
          {techs.map((tech) => (
            <MenuItem key={tech} value={tech}>
              {tech}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
