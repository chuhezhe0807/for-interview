import * as THREE from 'three'
import { createContext, useMemo, useRef, useState, useContext, useLayoutEffect, forwardRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine, Html } from '@react-three/drei';

const context = createContext();
export function Nodes({ children }) {
    const group = useRef();
    const [nodes, setNodes] = useState([]);
  
    const lines = useMemo(() => {
      const lines = [];
  
      for (const node of nodes) {
        node.connectedTo
          .map((ref) => [node.position, ref.current.position])
          .forEach(([start, end]) => lines.push({ start: start.clone().add({ x: 0.35, y: 0, z: 0 }), end: end.clone().add({ x: -0.35, y: 0, z: 0 }) }))
      }
  
      return lines;
    }, [nodes]);
  
    useFrame((_, delta) => group.current.children.forEach((group) => (group.children[0].material.uniforms.dashOffset.value -= delta * 10)))
  
    return (
      <context.Provider value={setNodes}>
        <group ref={group}>
          {lines.map((line, index) => (
            <group key={index}>
              <QuadraticBezierLine {...line} color="black" lineWidth={10} opacity={0.3} />
            </group>
          ))}
        </group>
        {children}
      </context.Provider>
    )
  }
  
export const Node = forwardRef(({ color = 'black', time, name, connectedTo = [], position = [0, 0, 0], ...props }, ref) => {
  const setNodes = useContext(context); // Nodes 组件的 context.provider
  const state = useMemo(() => ({ position: new THREE.Vector3(...position), connectedTo }), [position, connectedTo]);

  // Register this node on mount, unregister on unmount
  useLayoutEffect(() => {
    setNodes((nodes) => {
      return [...nodes, state];
    });

    return () => void setNodes((nodes) => nodes.filter((n) => n !== state));
  }, [state, position]);

  return (
    <mesh ref={ref} position={position} {...props}>
      <dodecahedronGeometry />
      <meshStandardMaterial roughness={0.75} emissive="#404057" />
      <Html distanceFactor={10}>
        <div className="content">{name}</div>
      </Html>
    </mesh>
  )
})