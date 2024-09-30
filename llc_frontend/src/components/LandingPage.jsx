import React, { useEffect, useState } from "react";
import "../style/landing_page.css";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

const phrases = ["LLC...", "Localhost Live Cloud"];
const Model = () => {
    const { scene } = useGLTF('src/assets/black_hole.glb'); // Update the path to your .glb model
    return <primitive object={scene} scale={1.5} />;
  };
const LandingPage = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 3000); // Change every 6 seconds (should match your animation duration)

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="root">
        <h1 data-text={phrases[currentPhrase]}>{phrases[currentPhrase]}</h1>
      </div>
      <Model></Model>
    </>
  );
};

export default LandingPage;
