import React, { useEffect, useState } from 'react';
import '../style/dashboard.css';
import { AiOutlinePlus, AiOutlineCheck, AiOutlineCode } from "react-icons/ai";
import axios from "axios";

import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [DeployedList, updateDeployedList] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    axios.get("http://localhost:8080/deploy")
      .then((res) => {
        updateDeployedList(res.data);
      })
      .catch((error) => {
        console.error("Error fetching deployed projects", error);
      });
  }, []);


  const handleCheckConsoleClick = (id,container_name) => {
      // console.log(`Card with ID ${id} clicked`);
      // console.log(container_name)
      navigate(`/check-console`,{state:{container_name}});
  };

  return (
    <>
      <div className='top-container'>
        <h1 className='top-container-h1'>Dashboard</h1>
        <div className='top-container-div'>
      
          <button className='top-container-button'>
            <AiOutlinePlus />
            Deploy Project
          </button>
        </div>
      </div>

     
        <div className='container-outer'>
           <label className='container-inner'>
            <AiOutlineCheck/>
              Running Projects
           </label>
        </div>
    

        <div className="deployed-list-container">
  {DeployedList.map((post) => {
    const { _id, application_name, container_name,tech } = post;
    return (
      <div key={_id} className="deployed-item">
        <div>
          <h2>{application_name}</h2>
          <h3>{tech}</h3>
        </div>
        <button className="check-console-button"
        onClick={() => handleCheckConsoleClick(_id, container_name)}
        >
          <AiOutlineCode />
          Check Console
        </button>
      </div>
    );
  })}
</div>
    </>
  );
}

export default Dashboard;
