import { Vector3 } from 'three';
import { useThree } from '@react-three/fiber';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';

import { StarRing } from './StarRing';
import { NodeConnectLineUnit } from './NodeConnectLineUnit';
import { NodeConnectLineUnitDoLeave } from './NodeConnectLineUnitDoLeave';

    // {id: "A1", subNodes: [], connectLines: [], position: [0, 0, 0], unorderedPos: [0, 0, 0], radius: 0.3},
    // {id: "A2", subNodes: [], connectLines: [], position: [-1.217, 1.3013 - 1.5, 1.9381], unorderedPos: [-1.217, 1.3013 - 1.5, 1.9381]}, //[1.217, 1.3013, 0.9381], },
    // {id: "A3", subNodes: [], connectLines: [], position: [0.2289, 1.6281 - 1.5, 3.1112], unorderedPos: [0.4289, 2.6281 - 1.5, 2.1112], },
    // {id: "A4", subNodes: [], connectLines: [], position: [0.9246, 1.0035 - 1.5, 1.1759], unorderedPos: [-1.217, 1.3013 - 1.5, 1.9381]},// [1.9246, 1.5035, -1.1759], },
    // {id: "A5", subNodes: [], connectLines: [], position: [-0.4534, 1.0 - 1.5, 1.4223], unorderedPos: [2.217, 3.3013 - 1.5, -1.9381]}, //[1.4534, 0.6, 1.0223]},
    // {id: "A6", subNodes: [], connectLines: [], position: [2.2928, 1.009 - 1.5, 2.0836], unorderedPos: [2.2928, 1.6009 - 1.5, 2.0836]}, // [-2.2928, 1.5009, 1.0836]},
    // {id: "A7", subNodes: [], connectLines: [], position: [-0.1015, 1.5991 - 1.5, -3.0857], unorderedPos:[2.1015, 3.0991 - 1.5, -2.0857]},
    // {id: "A8", subNodes: [], connectLines: [], position: [0.9577, 1.0026 - 1.5, -1.1437], unorderedPos: [0.9577, 1.0026 - 1.5, -1.1437]}, //[1.9577, 1.0026, 1.1437]},
    // {id: "A9", subNodes: [], connectLines: [], position: [2.1394, 1.2927 - 1.5, -0.8272], unorderedPos: [1.9577, 3.2026 - 1.5, -1.1437]}, //[0.1394, 1.3927, 0.9272]},
    // {id: "A10", subNodes: [], connectLines: [], position: [2.9840, 1.597 - 1.5, 0.8139], unorderedPos: [2.9840, 1.597 - 1.5, 0.8139]}, // [1.9840, 1.597, 2.8139]}

// 中心点 [0, 0, 0],
const NODES = [
    {id: "A1", subNodes: [], connectLines: [], position: [0, 0, 0], unorderedPos: [0, 0, 0], radius: 0.3},
    {id: "A2", subNodes: [], connectLines: [], position: [1.5, -1.5, 0], unorderedPos: [-1.217, 1.3013 - 1.5, 1.9381]}, //[1.217, 1.3013, 0.9381], },
    {id: "A3", subNodes: [], connectLines: [], position: [-0.75, -1.5, 1.299], unorderedPos: [0.4289, 2.6281 - 1.5, 2.1112], },
    {id: "A4", subNodes: [], connectLines: [], position: [0.75, -1.5, -1.299], unorderedPos: [-1.217, 1.3013 - 1.5, 1.9381]},// [1.9246, 1.5035, -1.1759], },
    {id: "A5", subNodes: [], connectLines: [], position: [1.15, -1.7, -1.99], unorderedPos: [2.217, 3.3013 - 1.5, -1.9381]}, //[1.4534, 0.6, 1.0223]},
    {id: "A6", subNodes: [], connectLines: [], position: [-2.3, -1.7, 0], unorderedPos: [2.2928, 1.6009 - 1.5, 2.0836]}, // [-2.2928, 1.5009, 1.0836]},
    {id: "A7", subNodes: [], connectLines: [], position: [1.15, -1.7, 1.99], unorderedPos:[2.1015, 3.0991 - 1.5, -2.0857]},
    {id: "A8", subNodes: [], connectLines: [], position: [-1.55, -2, -2.6846], unorderedPos: [0.9577, 1.0026 - 1.5, -1.1437]}, //[1.9577, 1.0026, 1.1437]},
    {id: "A9", subNodes: [], connectLines: [], position: [-1.55, -2, 2.6846], unorderedPos: [1.9577, 3.2026 - 1.5, -1.1437]}, //[0.1394, 1.3927, 0.9272]},
    {id: "A10", subNodes: [], connectLines: [], position: [3.1, -2, 0], unorderedPos: [2.9840, 1.597 - 1.5, 0.8139]}, // [1.9840, 1.597, 2.8139]}
]

const SUB_NODE_RADIUS = 0.3; // subNode 布局的半径
const SUB_NODE_OFFSET_Y = 1.3; // subNode 与node在y轴上的偏移量

/**
 * 计算两点间对称的三次贝塞尔曲线控制点
 * @param {Vector3} startPoint 起点 (P0)
 * @param {Vector3} endPoint   终点 (P3)
 * @param {number} curvature         曲率参数（控制弯曲强度）
 * @param {Vector3} upVector   参考上方向向量（用于确定弯曲平面）
 * @returns {Vector3[]} 两个贝塞尔控制点 [P1, P2]
 */
export function computeSymmetricControlPoints(startPoint, endPoint, curvature = 1, upVector = new Vector3(0, 1, 0)) {
    // Step 1: 计算中点
    const midpoint = new Vector3();
    midpoint.addVectors(startPoint, endPoint).multiplyScalar(0.5);

    // Step 2: 计算起点到终点的方向向量
    const direction = new Vector3();
    direction.subVectors(endPoint, startPoint);

    // Step 3: 生成垂直于方向向量的第一基准向量
    let orthoVector1 = new Vector3();
    orthoVector1.crossVectors(direction, upVector).normalize();

    // 如果方向与上向量平行，选择替代正交向量（如X轴）
    if (orthoVector1.length() < 0.0001) {
        orthoVector1 = new Vector3(1, 0, 0);
    }

    // Step 4: 生成垂直于方向向量的第二基准向量，是为了计算出来的控制点是在 startPoint, endPoint 连线平面内
    const orthoVector2 = new Vector3().crossVectors(direction, orthoVector1).normalize();

    // Step 5: 根据曲率计算控制点偏移
    const offset = orthoVector2.multiplyScalar(curvature * direction.length() * 0.25);

    // Step 6: 生成对称控制点
    const p1 = midpoint.clone().add(offset);
    const p2 = midpoint.clone().sub(offset);

    return [p1, p2];
}

// 根据center位置随机生成radius范围内的pointCount个点
function generateScatteredPoints(center = new Vector3(0, 0, 0), random = false, radius = 1, minDistance = 0.3,
    pointCount = 6, maxAttempts = 100 ) {
    const points = [];
    
    // 生成候选点（球体内均匀分布）
    const generateCandidate = () => {
        const dir = new Vector3().randomDirection();
        const dist = radius * (random ? Math.cbrt(Math.random()) : 1);
        return dir.multiplyScalar(dist).add(center);
    };

    // 距离验证函数
    const isValid = (candidate) => {
        return points.every(p => p.distanceTo(candidate) >= minDistance);
    };

    // 主生成循环
    for (let i = 0; i < pointCount; i++) {
        let candidate;
        let valid = false;
        let attempts = 0;

        do {
            candidate = generateCandidate();
            valid = isValid(candidate);
            attempts++;
        } while (!valid && attempts < maxAttempts);

        if (!valid) {
            console.warn(`Point ${i+1} 无法满足最小间距要求`);
        }

        points.push(candidate.clone());
    }

    return points.map((point) => point.toArray());
}

// 获取节点
function getNodes(isOrdered, camera) {
    const nodes = [];

    if(isOrdered) {
        NODES.slice(1).forEach((_node, index) => {
            const node = {..._node, subNodes: [..._node.subNodes], connectLines: [..._node.connectLines]};
            // node.position = getOrderedPosUnderCurProject(node.orderedPosProjectBefore, camera);
            // const subNode1 = getOrderedPosUnderCurProject(node.subNodesOrderedPosProjectBefore[0], camera);
            // const subNode2 = getOrderedPosUnderCurProject(node.subNodesOrderedPosProjectBefore[1], camera);
            // const subNode3 = getOrderedPosUnderCurProject(node.subNodesOrderedPosProjectBefore[2], camera);
            const [x, y, z] = node.position;
            const subNode1 = [x - SUB_NODE_RADIUS, y - SUB_NODE_OFFSET_Y, z];
            const subNode2 = [x + SUB_NODE_RADIUS/2, y - SUB_NODE_OFFSET_Y, z + SUB_NODE_RADIUS * 1.732/2]; // 1.732 = 根号3
            const subNode3 = [x + SUB_NODE_RADIUS/2, y - SUB_NODE_OFFSET_Y, z - SUB_NODE_RADIUS * 1.732/2];

            const [subNode1MidA, subNode1MidB] = computeSymmetricControlPoints(new Vector3(...node.position), new Vector3(...subNode1), 0.5);
            const [subNode2MidA, subNode2MidB] = computeSymmetricControlPoints(new Vector3(...node.position), new Vector3(...subNode2), 0.5);
            const [subNode3MidA, subNode3MidB] = computeSymmetricControlPoints(new Vector3(...node.position), new Vector3(...subNode3), 0.5);

            node.subNodes = []; // 置空，防止严格模式走两次空依赖的useMemo
            node.subNodes.push({ id: `${node.id}-1`, position: subNode1, radius: 0.06 });
            node.subNodes.push({ id: `${node.id}-2`, position: subNode2, radius: 0.06 });
            node.subNodes.push({ id: `${node.id}-3`, position: subNode3, radius: 0.06 });
            node.connectLines = [{start: NODES[0].position, end: node.position, needStraightLine: true}];
            node.connectLines.push({start: node.position, end: subNode1, midA: subNode1MidA, midB: subNode1MidB});
            node.connectLines.push({start: node.position, end: subNode2, midA: subNode2MidA, midB: subNode2MidB});
            node.connectLines.push({start: node.position, end: subNode3, midA: subNode3MidA, midB: subNode3MidB});
            node.isExpanded = true;
            nodes.push(node);
        });

        // 生成随机点
        // const generateNodesPos = generateScatteredPoints(new Vector3(0, 1.5, 0), true, 35, 1, 600, 100);
        // generateNodesPos.forEach((generateNodePos, index) => { 
        //     const [x, y, z] = generateNodePos;
        //     const subNode1 = [x - SUB_NODE_RADIUS, y - SUB_NODE_OFFSET_Y, z];
        //     const subNode2 = [x + SUB_NODE_RADIUS/2, y - SUB_NODE_OFFSET_Y, z + SUB_NODE_RADIUS * 1.732/2]; // 1.732 = 根号3
        //     const subNode3 = [x + SUB_NODE_RADIUS/2, y - SUB_NODE_OFFSET_Y, z - SUB_NODE_RADIUS * 1.732/2];

        //     const node = {
        //         id: `generate-node-${index}`,
        //         position: generateNodePos,
        //         subNodes: [],
        //         connectLines: [],
        //         unorderedPos: generateNodePos
        //     };

        //     const [subNode1MidA, subNode1MidB] = computeSymmetricControlPoints(new Vector3(...node.position), new Vector3(...subNode1), 0.5);
        //     const [subNode2MidA, subNode2MidB] = computeSymmetricControlPoints(new Vector3(...node.position), new Vector3(...subNode2), 0.5);
        //     const [subNode3MidA, subNode3MidB] = computeSymmetricControlPoints(new Vector3(...node.position), new Vector3(...subNode3), 0.5);

        //     node.subNodes.push({ id: `${node.id}-1`, position: subNode1, radius: 0.06 });
        //     node.subNodes.push({ id: `${node.id}-2`, position: subNode2, radius: 0.06 });
        //     node.subNodes.push({ id: `${node.id}-3`, position: subNode3, radius: 0.06 });
        //     node.connectLines.push({start: node.position, end: subNode1, midA: subNode1MidA, midB: subNode1MidB});
        //     node.connectLines.push({start: node.position, end: subNode2, midA: subNode2MidA, midB: subNode2MidB});
        //     node.connectLines.push({start: node.position, end: subNode3, midA: subNode3MidA, midB: subNode3MidB});
        //     node.isExpanded = true;
        //     nodes.push(node);
        // });
    }
    else {
        NODES.slice(1).forEach((_node, index) => {
            const node = {..._node, subNodes: [..._node.subNodes], connectLines: [..._node.connectLines], opacity: 0.7};
            const subNodes = generateScatteredPoints(new Vector3(...node.unorderedPos));

            node.subNodes = []; // 置空，防止严格模式走两次空依赖的useMemo
            node.connectLines = [{start: NODES[0].position, end: node.unorderedPos, lineWidth: 3}];
            subNodes.forEach((subNode, subIndex) => {
                node.subNodes.push({ id: `${node.id}-${subIndex}`, position: subNode, radius: 0.06 });
                node.connectLines.push({start: node.unorderedPos, end: subNode, opacity: 0.7});
            });

            node.isExpanded = true;
            nodes.push(node);
        });

        // 生成随机点
        const generateNodesPos = generateScatteredPoints(new Vector3(0, 0, 0), false, 3, 1, 20, 100);
        generateNodesPos.forEach((generateNodePos, index) => {
            const subNodes = generateScatteredPoints(new Vector3(...generateNodePos), false, 2, 1, 3);

            const node = {
                id: `generate-node-${index}`,
                position: generateNodePos,
                subNodes: [],
                connectLines: [],
                unorderedPos: generateNodePos,
                opacity: 0.7
            };

            if(index % 4 === 0) {
                node.connectLines.push({start: nodes[index].unorderedPos, end: node.unorderedPos, opacity: 0.3});
            }

            subNodes.forEach((subNode, subIndex) => {
                node.subNodes.push({ id: `${node.id}-${subIndex}`, position: subNode, radius: 0.06 });
                node.connectLines.push({start: node.unorderedPos, end: subNode});
            });

            nodes.push(node);
        })
    }
    
    return nodes;
}

// 切换到isOrdered时：根据NDC反推新位置 NDC（Normalized Device Coordinates）是标准化设备坐标，范围在 [-1, 1]（x 和 y），z 范围为 [0, 1]。
const getOrderedPosUnderCurProject = (projectedPosNdc, camera) => {
    const newPos = new Vector3(projectedPosNdc.x, projectedPosNdc.y, projectedPosNdc.z);
    
    // 关键步骤：反投影到新的世界坐标
    newPos.unproject(camera);
    
    // // 如果需保持原始深度，可手动设置（需根据场景调整）
    // const depth = p.originalZ; 
    // newPos.multiplyScalar(depth / newPos.z);

    return newPos.toArray();
}

export function Nodes(props) {
    const { camera } = useThree();
    const [isOrdered, setIsOrdered] = useState(false); // 是否是有序的布局
    const [currentData, setCurrentData] = useState(getNodes(isOrdered, camera));
    const [prevData, setPrevData] = useState([]);
    const prevIsOrderedRef = useRef(false);
    const starRingRef = useRef(null);

    useLayoutEffect(() => {
        // 切换时重置相机视角
        camera.position.set(3.1427, 2.2246, 3.1897);
        camera.rotation.set(-0.6090, 0.6796, 0.4131);
        starRingRef.current?.rotateRing();
    }, [isOrdered]);

    useEffect(() => {
        setOrderedProjectPos();
    }, []);
  
    // 初始加载时：记录所有ordered点的NDC坐标
    const setOrderedProjectPos = () => {
        NODES.slice(1).forEach((node) => {
            const pos = new Vector3(...node.position);
            pos.project(camera); // 世界坐标 -> NDC坐标
            node.orderedPosProjectBefore = pos;
            
            const [x, y, z] = node.position;
            const pos1 = new Vector3(...[x - SUB_NODE_RADIUS, y - SUB_NODE_OFFSET_Y, z]);
            pos1.project(camera); // 世界坐标 -> NDC坐标
            const pos2 = new Vector3(...[x + SUB_NODE_RADIUS/2, y - SUB_NODE_OFFSET_Y, z + SUB_NODE_RADIUS * 1.732/2]); // 1.732 = 根号3
            pos2.project(camera); // 世界坐标 -> NDC坐标
            const pos3 = new Vector3(...[x + SUB_NODE_RADIUS/2, y - SUB_NODE_OFFSET_Y, z - SUB_NODE_RADIUS * 1.732/2]);
            pos3.project(camera); // 世界坐标 -> NDC坐标
            node.subNodesOrderedPosProjectBefore = [pos1, pos2, pos3];
        });
    }

    const onCenterPointClick = () => {
        prevIsOrderedRef.current = isOrdered;
        setIsOrdered(c => !c);
        setPrevData([...currentData]);
        setCurrentData(getNodes(!isOrdered, camera));
    }

    return (
        <group>
            {/* 星环 */}
            {isOrdered && <StarRing ref={starRingRef} />}

            {/* 中心点 */}
            <NodeConnectLineUnit key={NODES[0].id} {...props} node={NODES[0]} {...NODES[0]} onClick={onCenterPointClick} />
            {
                currentData.map((node) => (
                    <NodeConnectLineUnit key={`${node.id}${isOrdered}`} {...props} {...node} node={node} position={isOrdered ? node.position : node.unorderedPos} isOrdered={isOrdered} />
                ))
            }
            {
                // 执行消失动画
                prevData.map((node, index) => (
                    <NodeConnectLineUnitDoLeave
                        key={`${node.id}${prevIsOrderedRef.current}leave`} {...props} {...node} node={node} isOrdered={prevIsOrderedRef.current}
                        position={prevIsOrderedRef.current ? node.position : node.unorderedPos}
                    />
                ))
            }
        </group>
    )
}