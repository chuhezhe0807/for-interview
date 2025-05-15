import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, } from '@react-three/drei'

import { Nodes } from './Nodes';
export const App = () => {
  const controlRef = useRef();

  const disableDrag = () => {
    controlRef.current.enabled = false;
  };

  const enableDrag = () => {
    controlRef.current.enabled = true;
  };

  return (
    <Canvas flat camera={{ fov: 75, position: [3.1427, 2.2246, 3.1897], rotation: [-0.6090, 0.6796, 0.4131] }} eventSource={document.getElementById('root')} eventPrefix="client">
      <color attach="background" args={['#0b1117']} />
  
      {/* 节点 */}
      <Nodes disableDragControls={disableDrag} enableDragControls={enableDrag} />
  
      <OrbitControls 
        enablePan={true} 
        enableRotate={true} 
        enableZoom={true}
        zoomSpeed={0.6}
        panSpeed={0.5}
        ref={controlRef}
      />
  
      {/* <axesHelper args={[5]} /> */}
    </Canvas>
  )
}
