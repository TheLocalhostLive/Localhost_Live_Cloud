import Button from "@mui/joy/Button";
import { AiFillExclamationCircle, AiFillCode } from "react-icons/ai";


export default function InstanceCard({
  _id,
  container_name,
  tech,
  handleTerminateClick,
  handleLaunchClick,
}) {
  return (
    <div key={container_name} className="deployed-item">
      <div>
        <h2>{container_name}</h2>
        <h3>{tech}</h3>
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
