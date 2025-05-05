import { Text, Billboard, Line } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import React, { useMemo, useState, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import gsap from "gsap";

import GlowingSphere from './GlowingSphere';

// 生成节点数据
const NODES = [
  { id: 'A1', position: [2, 3, 3], color: '#F39C12' },
  { id: 'A2', position: [-2, 3, 2], color: '#2E86C1' },
  { id: 'A3', position: [0, 3, -2], color: '#2E86C1' },
  { id: 'A4', position: [3, 3, 1], color: '#2E86C1' },
  { id: '_A1', position: [6, 2, 3], color: '#2E86C1' },
  { id: '_A2', position: [-5, 2, 2], color: '#2E86C1' },
  { id: '_A3', position: [3, 2, -2], color: '#2E86C1' },
  { id: '_A4', position: [6, 2, 1], color: '#2E86C1' },
  { id: '_B1', position: [8, -2, 2], color: '#2E86C1' },
  { id: '_B2', position: [1, -1, 3], color: '#2E86C1' },
  { id: '_B3', position: [-8, -2, -1], color: '#2E86C1' },
  { id: '_B4', position: [-7, -2, 2], color: '#2E86C1' },
  { id: '_B5', position: [6, -2, -2], color: '#2E86C1' },
  { id: '_B6', position: [5, -1, 3], color: '#2E86C1' },
  { id: '_B7', position: [9, -3, -1], color: '#2E86C1' },
  { id: '_B8', position: [8, 2, -2], color: '#2E86C1' },
  { id: 'B1', position: [3, -1, 2], color: '#2E86C1' },
  { id: 'B2', position: [0, 0, 3], color: '#2E86C1' },
  { id: 'B3', position: [-3, -1, -1], color: '#2E86C1' },
  { id: 'B4', position: [2, 0, 2], color: '#2E86C1' },
  { id: 'B5', position: [-2, -1, -2], color: '#2E86C1' },
  { id: 'B6', position: [-1, 0, 3], color: '#2E86C1' },
  { id: 'B7', position: [2, -2, -1], color: '#2E86C1' },
  { id: 'B8', position: [0, 0, -2], color: '#2E86C1' },
  { id: 'C1', position: [-1, 1, -4], color: '#2E86C1' },
  { id: 'C2', position: [-1, 0, -5], color: '#2E86C1' },
  { id: 'C3', position: [0, 1, -8], color: '#2E86C1' },
  { id: 'C4', position: [2, 2, -6], color: '#2E86C1' },
  { id: 'C5', position: [0, 1, -6], color: '#2E86C1' },
  { id: 'C6', position: [2, 2, -9], color: '#2E86C1' },
  { id: 'D1', position: [1, -1, -6], color: '#2E86C1' },
  { id: 'D2', position: [-2, -2, -6], color: '#2E86C1' },
  { id: 'D3', position: [-2, -1, -5], color: '#2E86C1' },
  { id: 'D4', position: [0, -3, -4], color: '#2E86C1' },
  { id: 'D5', position: [3, -2, -8], color: '#2E86C1' },
  { id: 'D6', position: [1, -1, -4], color: '#2E86C1' },
  { id: 'D7', position: [0, -2, -10], color: '#2E86C1' },
  { id: 'D8', position: [-3, -1, -7], color: '#2E86C1' },
  { id: 'D9', position: [0, -2, -9], color: '#2E86C1' },
  { id: 'D10', position: [2, -1, -10], color: '#2E86C1' },
  { id: 'D11', position: [3, -2, -12], color: '#2E86C1' },
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
  { from: '_A1', to: '_B1' },
  { from: '_A1', to: '_B2' },
  { from: '_A2', to: '_B3' },
  { from: '_A2', to: '_B4' },
  { from: '_A3', to: '_B5' },
  { from: '_A3', to: '_B6' },
  { from: '_A4', to: '_B7' },
  { from: '_A4', to: '_B8' },
  { from: 'C1', to: 'D1' },
  { from: 'C1', to: 'D2' },
  { from: 'C2', to: 'D3' },
  { from: 'C2', to: 'D4' },
  { from: 'C3', to: 'D5' },
  { from: 'C3', to: 'D6' },
  { from: 'C4', to: 'D7' },
  { from: 'C4', to: 'D8' },
  { from: 'C5', to: 'D9' },
  { from: 'C5', to: 'D10' },
  { from: 'C6', to: 'D11' },
];

const ALIVE_NODE_IDS = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"];
const ALIVE_LINK_FROM_IDS = ["A1", "A2", "A3", "A4"];
  
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

// 执行消失动画
const executeDisappearAnimation = (meshRef) => {
  gsap.to(meshRef.scale, {
    x: 0,
    y: 0,
    z: 0,
    duration: 1,
    ease: "power4.out"
  })
  
  gsap.to(meshRef.material, {
    opacity: 0,
    duration: 0.8
  })
}

function createComposer(scene, camera, renderer) {
    //使用场景和相机创建RenderPass通道
    const renderPass = new RenderPass(scene, camera)

    //创建UnrealBloomPass泛光通道
    const unrealBloomPass = new UnrealBloomPass(
        new THREE.Vector2(256, 256),
        20,
        2.1,
        0
    )
    unrealBloomPass.renderToScreen = true

    //创建效果组合器
    const composer = new EffectComposer(renderer)

    //将创建的通道添加到EffectComposer(效果组合器)对象中
    composer.addPass(renderPass)
    composer.addPass(unrealBloomPass)

    return composer;
}

export const KnowledgeGraph = (props, ref) => {
  const { camera, gl, scene } = useThree();
  const [nodes, setNodes] = useState(NODES);
  const [links, setLinks] = useState(LINKS);
  const isFocused = useRef(false);
  const groupRef = useRef();
  
  const composer = useMemo(() => createComposer(scene, camera, gl), []);

  // 计算连接线位置
  const lines = useMemo(() => {
    return links.map(link => {
      const fromNode = nodes.find(n => n.id === link.from)
      const toNode = nodes.find(n => n.id === link.to)

      return { start: fromNode.position, end: toNode.position, fromNodeId: fromNode.id, toNodeId: toNode.id };
    })
  }, [nodes]);

  // 后期效果
  useFrame((_, delta) => {
      composer.render(delta) //效果组合器更新
  })

  const onClick = (event) => {
    const {node, isExpanded} = event.eventObject;
    let newNodes, newLinks;

    var direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    if(!isExpanded) {
        const supplementalNodes = [];
        const supplementalLinks = LINKS.filter(link => {
          if(isFocused.current && !ALIVE_LINK_FROM_IDS.includes(link.from)) {
            return false;
          }

          return link.from === node.id;
        });
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
        newLinks = links.filter(link => {
          if(isFocused.current && !ALIVE_LINK_FROM_IDS.includes(link.from)) {
            return false;
          }

          return link.from !== node.id;
        });
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

  const focusOnObject = (targetMesh) => {
    isFocused.current = true;
    // 聚焦
    props.focusOnObject(targetMesh, camera);
    // 除A开头的节点外，都消失，走透明度渐出动画
    if(groupRef.current?.children.length > 0) {
      groupRef.current.children.filter((group) => {
        const needDisappearNode = group.isGroup && !ALIVE_NODE_IDS.includes(group.children[0].node.id);
        const needDisappearLine = group.isLine2 && !ALIVE_LINK_FROM_IDS.includes(group.fromNodeId);

        if(needDisappearNode) {
          executeDisappearAnimation(group.children[0]);
          executeDisappearAnimation(group.children[1]);
        }
        else if(needDisappearLine) {
          executeDisappearAnimation(group);
        }
      });
    }
  };

  return (
    <>
      <group ref={groupRef}>
        {/* 渲染节点 */}
        {nodes.map((node) => {
          const onlyFocus = node.id.startsWith("A1");
          const isPrimary = node.id.startsWith("A");

          return (
              <group key={node.id} position={node.position}>
                  <mesh 
                  node={node} isExpanded={true} 
                  onClick={onlyFocus ? focusOnObject : onClick}
                  >
                      <sphereGeometry args={isPrimary ? [onlyFocus ? 0.5 : 0.4, 16, 8] : [0.2, 10, 5]} />
                      <meshStandardMaterial 
                          color={onlyFocus ? "#fff" : node.color} 
                          emissive={node.color} 
                          emissiveIntensity={2} 
                          toneMapped={false}
                          wireframe={true}
                  />
                  </mesh>
                  {
                    onlyFocus && <GlowingSphere />
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
    </>
  )
};