import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';


const VirtulMatchine = () => {
    const { state } = useLocation();
    const { container_name } = state || "";
    const [public_url, updatePublic_url] = useState("");

    useEffect(() => {
        axios.get(`http://localhost:8080/launch/${container_name}`
        )
            .then((res) => {
                updatePublic_url(res.data.public_url); // Assuming the response contains the public URL
            })
            .catch((error) => {
                console.error("Error fetching deployed projects", error);
            });
    }, [container_name]); // Depend on container_name

    // Navigate to the public URL when it's updated
    useEffect(() => {
        if (public_url) {
            window.location.href = public_url; // Redirect to the public URL
        }
    }, [public_url]);

    return (
        <div>
            {/* You can add additional UI elements here if needed */}
            <h1>Launching Virtual Machine...</h1>
            <h2> It May take some time</h2>
        </div>
    );
}

export default VirtulMatchine;
