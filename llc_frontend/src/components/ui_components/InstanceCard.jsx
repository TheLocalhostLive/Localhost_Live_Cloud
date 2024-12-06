import { Chip, Button } from "@mui/material";
import { AiFillCode, AiFillSetting, AiFillDelete } from "react-icons/ai";
import { IoMdRefresh } from "react-icons/io";

export default function InstanceCard({
  _id,
  container_name,
  handleTerminateClick,
  handleLaunchClick,
  handleConfigure,
  status,
  onGetUpdateClick
}) {
  const chipColor = {
    HEALTHY: "success",
    PENDING: "info",
    TERMINATED: "warning",
    FAILED: "error",
  };

  function handleGetUpdateClick() {
    onGetUpdateClick(_id);
  }

  return (
    <div key={container_name} className="deployed-item">
      <div>
        <div className="left-cont">
          <h2>{container_name}</h2>
          <div className="status">
            <Chip
              size={"small"}
              clickable
              label={status}
              color={chipColor[status]}
            />
          </div>
        </div>
        {status === "HEALTHY" && (
          <>
            <Button
              onClick={() => handleLaunchClick(_id, container_name)}
              variant="contained"
              color="primary"
              size="large"
              title="Open SSH"
              sx={{ mr: 2 }}
            >
              <AiFillCode />
            </Button>

            <Button
              onClick={() => handleConfigure(container_name)}
              variant="contained"
              color="info"
              size="large"
              title="Configure"
            >
              <AiFillSetting />
            </Button>
          </>
        )}
         {status === "PENDING" && (
          <>
            <Button
              onClick={handleGetUpdateClick}
              variant="contained"
              color="primary"
              size="large"
              title="Get Updates"
              sx={{ mr: 2 }}
              
            >
              <IoMdRefresh />
            </Button>

          </>
        )}
      </div>
      <div className="deployed-item-inner">
        <Button
          onClick={() => handleTerminateClick(container_name)}
          variant="outlined"
          color="warning"
          size="large"
          title="Terminate"
          disabled={status !== "HEALTHY"}
        >
          <AiFillDelete />
        </Button>
      </div>
    </div>
  );
}
