import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Billboard, Line } from '@react-three/drei'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { createRoot } from "react-dom/client";
import * as THREE from 'three'
import gsap from "gsap";
import {Particles} from "./Particles";

import "./styles.css";

// 生成节点数据
const NODES = [
  { id: 'A1', position: [2, 3, 3], color: '#F39C12' },
  { id: 'A2', position: [-2, 3, 2], color: '#F39C12' },
  { id: 'A3', position: [0, 3, -2], color: '#F39C12' },
  { id: 'A4', position: [3, 3, 1], color: '#F39C12' },
  { id: 'B1', position: [3, -1, 2], color: '#2E86C1' },
  { id: 'B2', position: [0, 0, 3], color: '#2E86C1' },
  { id: 'B3', position: [-3, -1, -1], color: '#2E86C1' },
  { id: 'B4', position: [2, 0, 2], color: '#2E86C1' },
  { id: 'B5', position: [-2, -1, -2], color: '#2E86C1' },
  { id: 'B6', position: [-1, 0, 3], color: '#2E86C1' },
  { id: 'B7', position: [2, -2, -1], color: '#2E86C1' },
  { id: 'B8', position: [0, 0, -2], color: '#2E86C1' },
]

// 生成连接关系
const LINKS = [
  { from: 'A1', to: 'B1' },
  { from: 'A1', to: 'B2' },
  { from: 'A2', to: 'B3' },
  { from: 'A2', to: 'B4' },
  { from: 'A3', to: 'B5' },
  { from: 'A3', to: 'B6' },
  { from: 'A4', to: 'B7' },
  { from: 'A4', to: 'B8' },
];

// 执行位置动画
const executePositionAnimation = (group, targetPosition, updateCallback, completeCallback) => {
    gsap.to(group.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1.5,
        ease: 'linear',
        onComplete: () => {
            completeCallback && completeCallback();
        },
        onUpdate: function () {
            updateCallback && updateCallback(this.progress());
        }
    })
}

function KnowledgeGraph() {
  const [nodes, setNodes] = useState(NODES);
  const [links, setLinks] = useState(LINKS);
  const groupRef = useRef();

  // 计算连接线位置
  const lines = useMemo(() => {
    return links.map(link => {
      const fromNode = nodes.find(n => n.id === link.from)
      const toNode = nodes.find(n => n.id === link.to)

      return { start: fromNode.position, end: toNode.position, fromNodeId: fromNode.id, toNodeId: toNode.id };
    })
  }, [nodes]);

  const onClick = (event) => {
    const {node, isExpanded} = event.eventObject;
    let newNodes, newLinks;

    if(!isExpanded) {
        const supplementalNodes = [];
        const supplementalLinks = LINKS.filter(link => link.from === node.id);
        supplementalLinks.map(link => link.to).forEach((id) => {
            const subNode = NODES.find(node => node.id === id);
            subNode && supplementalNodes.push(subNode);
        });

        newNodes = [...nodes, ...supplementalNodes];
        newLinks = [...links, ...supplementalLinks];
        event.eventObject.isExpanded = true;

        // 1、先在起始点生成子节点（与起始点的位置一样）
        setNodes([...nodes, ...(supplementalNodes.map(subNode => ({...subNode, position: node.position})))]);
        setLinks(newLinks);

        // 2、然后再做动画慢慢伸长
        setTimeout(() => {
          if(groupRef.current?.children.length > 0) {
            const currentGroup = event.eventObject.parent;
            const expandNodesRef = [];
            const expandLinesRef = [];
            groupRef.current?.children.forEach((group) => {
                if(group.isGroup) {
                  const find = supplementalNodes.find(i => i.id === group.children[0].node.id);

                  if(find) {
                    group.__targetPosition = new THREE.Vector3(...find.position);
                    expandNodesRef.push(group);
                  }
                }
                else if(group.isLine2 && group.fromNodeId === node.id) {
                  expandLinesRef.push(group);
               }
            });

            expandNodesRef.forEach((group) => {
                const line = expandLinesRef.find((line) => line.toNodeId === group.children[0].node.id);
                const startPoint = currentGroup.position;
                const endPoint = group.__targetPosition.clone();

                executePositionAnimation(group, group.__targetPosition, 
                  (progress) => {
                    // // 计算当前终点位置 currentEnd = A + (B - A) * progress
                    const currentEnd = startPoint.clone().lerp(endPoint, progress);
                    line.geometry.setPositions([
                      startPoint.x, startPoint.y, startPoint.z,
                      currentEnd.x, currentEnd.y, currentEnd.z
                    ]);
                    line.geometry.attributes.position.needsUpdate = true
                  },
                  () => {
                    setNodes(newNodes);
                  }
                );
            });
        }
        }, 0);
    }
    else {
        const subNodesIds = links.filter(link => link.from === node.id).map(i => i.to);
        newLinks = links.filter(link => link.from !== node.id);
        newNodes = nodes.filter(node => !subNodesIds.includes(node.id));
        event.eventObject.isExpanded = false;

        if(groupRef.current?.children.length > 0) {
            const currentGroup = event.eventObject.parent;
            const retractNodesRef = [];
            const retractLinesRef = [];
            groupRef.current?.children.forEach((group) => {
                if(group.isGroup && subNodesIds.includes(group.children[0].node.id)) {
                    retractNodesRef.push(group);
                  }
                  else if(group.isLine2 && group.fromNodeId === node.id) {
                    retractLinesRef.push(group);
                }
            });

            retractNodesRef.forEach((group) => {
                const line = retractLinesRef.find((line) => line.toNodeId === group.children[0].node.id);
                const startPoint = currentGroup.position;
                const endPoint = group.position.clone();

                executePositionAnimation(group, currentGroup.position, 
                  (progress) => {
                    // 计算当前终点位置 currentEnd = A + (B - A) * progress
                    const currentEnd = endPoint.clone().lerp(startPoint, progress);
                    line.geometry.setPositions([
                      startPoint.x, startPoint.y, startPoint.z,
                      currentEnd.x, currentEnd.y, currentEnd.z
                    ]);
                    line.geometry.attributes.position.needsUpdate = true
                  },
                  () => {
                    setLinks(newLinks);
                    setNodes(newNodes);
                  }
                );
            });
        }
    }
  };

  return (
    <group ref={groupRef}>
      {/* 渲染节点 */}
      {nodes.map((node) => {
        const isPrimary = node.id.startsWith("A");

        return (
            <group key={node.id} position={node.position}>
                <mesh 
                node={node} isExpanded={true} onClick={onClick}
                >
                    <sphereGeometry args={isPrimary ? [0.4, 16, 8] : [0.2, 10, 5]} />
                    <meshStandardMaterial 
                        color={isPrimary ? "#fff" : node.color} 
                        emissive={node.color} 
                        emissiveIntensity={2} 
                        toneMapped={false}
                        wireframe={true}
                />
                </mesh>
                {
                  isPrimary && <mesh>
                    <sphereGeometry args={[0.3, 16, 8]} />
                    <meshStandardMaterial 
                        color={node.color} 
                        emissive={node.color} 
                        emissiveIntensity={2} 
                        toneMapped={false}
                        // wireframe={true}
                />
                </mesh>
                }
            <Billboard>
              <Text
                  position={[0, isPrimary ? 0.5 : 0.3, 0]}
                  fontSize={0.15}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
              >
                  {node.id}
              </Text>
            </Billboard>
          </group>
        )
      })}

      {/* 渲染连接线 */}
      {lines.map((line, idx) => (
        <Line
          key={idx}
          fromNodeId={line.fromNodeId}
          toNodeId={line.toNodeId}
          points={[line.start, line.end]}
          color="white"
          lineWidth={0.5}
        />
      ))}
    </group>
  )
}

function App() {
  const mouse = useRef([0, 0]);

  return (
    <>
      <div className="content">点击黄色的节点可收起子节点，再次点击可展开</div>
      <Canvas camera={{ position: [0, 3, 12], fov: 50 }}>
        {/* 暗色背景 */}
        <color attach="background" args={['#1a1a1a']} />
        
        {/* 环境光 */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Particles count={10000} mouse={mouse}/>

        <KnowledgeGraph />

        <OrbitControls 
          enablePan={true} 
          enableRotate={true} 
          enableZoom={true}
          zoomSpeed={0.6}
          panSpeed={0.5}
        />

        {/* <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        </EffectComposer> */}

          {/* <axesHelper args={[5]} /> */}
      </Canvas>
    </>
  )
}

createRoot(document.getElementById("root")).render(<App />);