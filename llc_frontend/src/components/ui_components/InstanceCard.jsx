import { Chip, Button } from "@mui/material";
import { AiFillCode, AiFillSetting, AiFillDelete } from "react-icons/ai";

export default function InstanceCard({
  _id,
  container_name,
  handleTerminateClick,
  handleLaunchClick,
  handleConfigure
}) {
  return (
    <div key={container_name} className="deployed-item">
      <div>
        <div className="left-cont">
          <h2>{container_name}</h2>
          <div className="status">
            <Chip
              size={"small"}
              clickable
              label={"healthy"}
              color={"success"}
            />
          </div>
        </div>
        <Button
          onClick={() => handleLaunchClick(_id, container_name)}
          variant="contained"
          color="primary"
          size="large"
          title="Open SSH"
          sx={{mr: 2}}
        >
          <AiFillCode />
          
        </Button>
        
        <Button
          onClick={() => handleConfigure( container_name)}
          variant="contained"
          color="info"
          size="large"
          title="Configure"
        >
          <AiFillSetting  />
        </Button>
      </div>
      <div className="deployed-item-inner">
        <Button
          onClick={() => handleTerminateClick(container_name)}
          variant="outlined"
          color="warning"
          size="large"
          title="Terminate"
        >
          <AiFillDelete />
          
        </Button>
      </div>
    </div>
  );
}
