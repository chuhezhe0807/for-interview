import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import React, { useRef } from 'react'
import { createRoot } from "react-dom/client";
import * as THREE from 'three'

import {KnowledgeGraph} from './KnowledgeGraph';
import "./styles.css";

function App() {
  const cameraControlRef = useRef();
  const target = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);
  // 聚焦函数
  const focusOnObject = (targetMesh, camera) => {
    targetMesh.stopPropagation();

    const box = new THREE.Box3().setFromObject(targetMesh.eventObject)
    // const center = box.getCenter(new THREE.Vector3())
    const center = new THREE.Vector3(-0.03323726365372273, 0.007678448359232736, -0.9994179935020221);
    const size = box.getSize(new THREE.Vector3())
    
    // 计算相机距离
    const maxDim = Math.max(size.x, size.y, size.z)
    const distance = maxDim * 3
    
    // 计算新相机位置
    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    // const newPosition = center.clone().sub(direction.multiplyScalar(distance)) // 聚焦
    // 相机去到指定位置
    const newPosition = new THREE.Vector3(0.2428636176941868, 0.7280770997765761, 12.048739860051079);
    
    // 设置动画参数
    target.current.copy(center)
    isAnimating.current = true
    
    // 动画循环
    const animate = () => {
      if (!isAnimating.current) {
        return;
      }
      
      // 平滑过渡相机位置
      camera.position.lerp(newPosition, 0.05)
      cameraControlRef.current.target.lerp(target.current, 0.1)
      cameraControlRef.current.update()
      
      // 判断动画结束
      if (camera.position.distanceToSquared(newPosition) < 0.01 && 
          cameraControlRef.current.target.distanceToSquared(target.current) < 0.01) {
        isAnimating.current = false
      }

      requestAnimationFrame(animate)
    }

    animate();
  }

  return (
    <>
      <div className="content">点击黄色的节点可收起子节点，再次点击可展开</div>
      <div className="content">点击A1节点可聚焦到固定视角</div>
      <Canvas camera={{ position: [0, 3, 12], fov: 50 }}>
        {/* 暗色背景 */}
        <color attach="background" args={['#1a1a1a']} />
        
        {/* 环境光 */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />

        <KnowledgeGraph focusOnObject={focusOnObject}/>

        <OrbitControls 
          enablePan={true} 
          enableRotate={true} 
          enableZoom={true}
          zoomSpeed={0.6}
          panSpeed={0.5}
          ref={cameraControlRef}
        />
        {/* <axesHelper args={[5]} /> */}
      </Canvas>
    </>
  )
}

createRoot(document.getElementById("root")).render(<App />);