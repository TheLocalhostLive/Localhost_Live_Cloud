import React, { useEffect, useState } from "react";
import "../style/dashboard.css";
import { AiOutlinePlus, AiOutlineCheck, AiOutlineCode } from "react-icons/ai";
import axios from "axios";
import Button from "@mui/joy/Button";

import { AiFillHeart } from "react-icons/ai";

import { useNavigate } from "react-router-dom";
import BasicChips from "./ui_components/BasicChips";

function Dashboard() {
  const [DeployedList, updateDeployedList] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get("http://localhost:8080/deploy")
      .then((res) => {
        updateDeployedList(res.data);
      })
      .catch((error) => {
        console.error("Error fetching deployed projects", error);
      });
  }, []);

  const handleCheckConsoleClick = (id, container_name) => {
    // console.log(`Card with ID ${id} clicked`);
    // console.log(container_name)
    navigate(`/check-console`, { state: { container_name } });
  };
  const handleDepoyProjectClick = () => {
    // console.log(`Card with ID ${id} clicked`);
    // console.log(container_name)
    navigate(`/deploy`);
  };

  return (
    <>
      <div className="top-container">
        <h1 className="top-container-h1">Dashboard</h1>
        <div className="top-container-div">
          <Button
            color="warning"
            onClick={handleDepoyProjectClick}
            variant="outlined"
            sx={{
              color: "rgb(255,215,0)",
              display: "flex", // Ensure flexbox is applied to align items
              alignItems: "center", // Align icon and text vertically
              gap: "5px", // Space between the icon and text
              "&:hover": {
                color: "rgb(218,165,32)", // Adjust the text color on hover
              },
            }}
          >
            <AiOutlinePlus />
            Deploy Project
          </Button>
          <Button
            color="warning"
            onClick={function () {}}
            variant="outlined"
            sx={{
              color: "rgb(255,215,0)",
              display: "flex", // Ensure flexbox is applied to align items
              alignItems: "center", // Align icon and text vertically
              gap: "5px", // Space between the icon and text
              "&:hover": {
                color: "rgb(218,165,32)", // Adjust the text color on hover
              },
            }}
          >
            <AiFillHeart />
            Donate
          </Button>
        </div>
      </div>

      <div className="container-outer">
        <BasicChips />
      </div>

      <div className="deployed-list-container">
        {DeployedList.map((post) => {
          const { _id, application_name, container_name, tech } = post;
          return (
            <div key={_id} className="deployed-item">
              <div>
                <h2>{application_name}</h2>
                <h3>{tech}</h3>
              </div>

              <Button
                color="danger"
                onClick={() => handleCheckConsoleClick(_id, container_name)}
                variant="outlined"
                sx={{
                  color: "danger",
                  display: "flex", // Ensure flexbox is applied to align items
                  alignItems: "center", // Align icon and text vertically
                  gap: "5px", // Space between the icon and text
                  "&:hover": {
                    color: "rgb(218,165,32)", // Adjust the text color on hover
                  },
                }}
              >
                <AiOutlineCode />
                Donate
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Dashboard;
