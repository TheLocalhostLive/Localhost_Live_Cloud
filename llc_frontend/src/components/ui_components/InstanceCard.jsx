import Button from "@mui/joy/Button";
import { Chip } from "@mui/material";
import { AiFillExclamationCircle, AiFillCode } from "react-icons/ai";


export default function InstanceCard({
  _id,
  container_name,
  handleTerminateClick,
  handleLaunchClick,
}) {
  return (
    <div key={container_name} className="deployed-item">
      <div className="left-cont">
        <h2>{container_name}</h2>
        <div className="status">
          <Chip size={"small"} clickable label={"healthy"} color={"success"}/>
        </div>
      </div>

      <div className="deployed-item-inner">
        <Button
          onClick={() => handleTerminateClick(container_name)}
          variant="outlined"
          sx={{
            borderColor: "black",
            color: "black",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            "&:hover": {
              backgroundColor: "black",
              color: "white",
              borderColor: "black",
            },
          }}
        >
          <AiFillExclamationCircle />
          Terminate
        </Button>

        <Button
          onClick={() => handleLaunchClick(_id, container_name)}
          variant="outlined"
          sx={{
            borderColor: "black",
            color: "black",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            "&:hover": {
              backgroundColor: "black",
              color: "white",
              borderColor: "black",
            },
          }}
        >
          <AiFillCode />
          Launch
        </Button>
      </div>
    </div>
  );
}
