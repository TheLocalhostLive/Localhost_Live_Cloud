import axios from 'axios';
import React, { useEffect } from 'react'
import { useState } from 'react';
import { useLocation , useParams} from 'react-router-dom'

import "../style/console.css";
export default function ConsolePage() {
    const {state }= useLocation()
    const {container_name} = state || "";
    const [logs, updateLogs] = useState("");
    useEffect(()=>{
        axios.get(`http://localhost:8080/process/${container_name}`)
      .then((res) => {
        updateLogs(res.data);
      })
      .catch((error) => {
        console.error("Error fetching deployed projects", error);
      });
    },[])
    
  return (
    <>
     <h1> Console For :{container_name}</h1>

        <dev className ="console">
            <div className='console-text'>
              {logs}
            </div>
        </dev>
    </>
  )
}
 