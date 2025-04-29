import { createRoot } from "react-dom/client";
import React, { useRef, useState, createRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Nodes, Node } from './Nodes';

import "./styles.css";

function Content() {
  const ref = useRef();
  const [[a, b, c, d, e]] = useState(() => [...Array(5)].map(createRef));

  // useFrame(() => (ref.current.rotation.z += 0.01));

  return (
    <group ref={ref}>
      <Nodes>
        <Node ref={a} name="a" position={[0, 6, 0]} connectedTo={[b]} />
        <Node ref={b} name="b" position={[0, 2, 0]} connectedTo={[c, d, e]} />
        <Node ref={c} name="c" position={[3, 0, 0]} />
        <Node ref={d} name="d" position={[0, 0, 3]} />
        <Node ref={e} name="e" position={[-3, 0, 0]} />
      </Nodes>
    </group>
  )
}

createRoot(document.getElementById("root")).render(
  <Canvas camera={{ position: [0, -4, -7.5] }}>
    <pointLight color="indianred" />
    <pointLight position={[10, 10, -10]} color="orange" />
    <pointLight position={[-10, -10, 10]} color="lightblue" />
    <Content />
    <OrbitControls makeDefault autoRotate enableZoom={true} enablePan={true} minPolarAngle={Math.PI / 1.7} maxPolarAngle={Math.PI / 1.7} />
  </Canvas>
)
