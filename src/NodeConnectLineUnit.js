import { Vector3, Frustum, Matrix4 } from 'three'
import { useState, useRef, useMemo, useEffect } from 'react'
import { useSpring, animated } from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'
import { useDetectGPU, Billboard, Text } from '@react-three/drei'

import { StraightConnectLineDoPosition, BezierConnectLineDoPosition, BezierConnectLineDoOpacity, StraightConnectLineDoOpacity } from './ConnectLine';

// LOD 配置
const LOD_CONFIG = {
    levels: [
        { type: 'high', distance: 5, updateFreq: 1 },   // 高模：每秒更新1次
        { type: 'medium', distance: 20, updateFreq: 2 }, // 中模：每2帧更新1次
        { type: 'low', distance: Infinity, updateFreq: 5 } // 低模：每5帧更新1次
    ],
    // 各LOD级别的几何体参数
    geometries: {
        high: { segments: 16, childrenVisible: true },
        medium: { segments: 8, childrenVisible: true },
        low: { segments: 4, childrenVisible: false }
    }
}

export const ANIMATION_CONFIG = {
    mass: 1,
    tension: 80,
    friction: 40,
    duration: 800
}

// 检测point是否在摄像机可视范围内
function checkIfPointIsVisible(point, camera) { 
    // 构建当前帧的视锥体
    const frustum = new Frustum();
    const projMatrix = new Matrix4()
        .multiplyMatrices(
            camera.projectionMatrix,
            camera.matrixWorldInverse
        )
    frustum.setFromProjectionMatrix(projMatrix);

    // 执行检测
    return frustum.containsPoint(point);
}

export function NodeConnectLineUnit({id, radius, position, subNodes, connectLines, disableDragControls, enableDragControls, ...props}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const camera = useThree(state => state.camera);
    const [lodLevel, setLodLevel] = useState(0);
    const updateCounter = useRef(0);
    const gpuTier = useDetectGPU();
    const noAnimationSpringProps = {position: props.isOrdered ? position : props.unorderedPos, scale: [1, 1, 1]};
    
    const isMainNodeNeedSpringAnimation = useMemo(() => {
        const positionVector = new Vector3(...position);
        const isVisible = checkIfPointIsVisible(positionVector, camera);
        const distance = positionVector.distanceTo(camera.position);

        return isVisible && distance <= 5;
    }, [position]);

    const [springProps, api] = useSpring(() => ({
        from: { opacity: 0 },
        config: ANIMATION_CONFIG
    }))

    useEffect(() => {
        api.start({
            to: { opacity: 0.3 }
        })

        return () => api.stop();
    }, [api]);

    // 自适应LOD更新策略
    useFrame(() => {
      // 根据GPU性能自动调整更新频率
      const freq = LOD_CONFIG.levels[lodLevel].updateFreq * (gpuTier.tier > 1 ? 1 : 2);
      
      if (updateCounter.current != null && (updateCounter.current % freq === 0)) {
        const distance = (new Vector3(...position)).distanceTo(camera.position);
        const newLevel = LOD_CONFIG.levels.findIndex(level => distance < level.distance);

        if (newLevel !== lodLevel) {
            setLodLevel(newLevel);
        }
      }
  
      if(updateCounter.current != null) {
        updateCounter.current++;
      }
    });
  
    // 当前LOD参数
    const { segments, childrenVisible } = LOD_CONFIG.geometries[LOD_CONFIG.levels[lodLevel].type];
    props.node.segments = segments; // 记录到node对象中，用于在渲染执行消失动画节点时使用
    props.node.childrenVisible = childrenVisible;

    function onClick(e) {
        if(props.onClick) {
            props.onClick(e);
        }
        else {
            setIsExpanded(c => !c);
            e.eventObject.node.isExpanded = !e.eventObject.node.isExpanded;
        }
    }

    return (
        <group key={id}>
            {/* MainNode */}
            {
                isMainNodeNeedSpringAnimation 
                    ? <MainNodeNeedSpringAnimation node={props.node} isOrdered={props.isOrdered} radius={radius} position={position} unorderedPos={props.unorderedPos} onClick={onClick} segments={segments} opacity={props.opacity}/> 
                    : <MainNodeWithoutSpringAnimation node={props.node} radius={radius} position={position} unorderedPos={props.unorderedPos} onClick={onClick} segments={segments} springProps={noAnimationSpringProps} opacity={props.opacity}/>
            }
            {
            //     <Billboard position={noAnimationSpringProps.position}>
            //     <group position={noAnimationSpringProps.position}>
            //         <Text
            //             position={[0, 0.2, 0]}
            //             fontSize={0.1}
            //             color="white"
            //             anchorX="center"
            //             anchorY="middle"
            //             >
            //             {props.node.id}
            //         </Text>
            //     </group>
            // </Billboard>

            }
            {childrenVisible && <>
                {
                    subNodes.map((node, index) => (
                        // <SubNode 
                        <SubNodeDoOpacity
                            key={`${node.id}${props.isOrdered}${index}`} 
                            {...node}
                            segments={segments}
                            initialPosition={props.isOrdered ? [position[0], node.position[1], position[2]] : position} 
                            isExpanded={isExpanded}
                        />
                    ))
                }
                {
                    props.isOrdered ? connectLines.map((line, index) => (
                        // <BezierConnectLineDoPosition key={`bezier${props.isOrdered}${index}`} {...line} isExpanded={isExpanded}/>
                        line.needStraightLine 
                            ? <StraightConnectLineDoOpacity key={`straight_center${props.isOrdered}${index}`} {...line} isExpanded={isExpanded} springProps={springProps}/>
                            : <BezierConnectLineDoOpacity key={`bezier${props.isOrdered}${index}`} {...line} isExpanded={isExpanded} springProps={springProps}/>
                    )) : connectLines.map((line, index) => (
                        // <StraightConnectLineDoPosition key={`straight${props.isOrdered}${index}`} {...line} isExpanded={isExpanded}/>
                        <StraightConnectLineDoOpacity key={`straight${props.isOrdered}${index}`} {...line} isExpanded={isExpanded} springProps={springProps}/>
                    ))
                }
            </>}
        </group>
    )
}

function SubNodeDoPosition({radius, position, initialPosition, isExpanded, segments}) {
    // 展开动画：位置、缩放
    const springProps = useSpring({
        // 从中心展开
        from: { position: (isExpanded ? initialPosition : position), scale: (isExpanded ? [0.2, 0.2, 0.2] : [1, 1, 1]), opacity: 0 },
        to: { position: (isExpanded ? position : initialPosition), scale: (isExpanded ? [1, 1, 1] : [0.2, 0.2, 0.2]), opacity: 1 },
        config: ANIMATION_CONFIG
    });

    return (
        <animated.mesh {...springProps}>
            <sphereGeometry args={[radius ?? 0.1, segments, segments]} />
            <meshBasicMaterial color={'#2196f3'} transparent/>
        </animated.mesh>
    )
}

function SubNodeDoOpacity({radius, position, initialPosition, isExpanded, segments}) {
    // 展开动画：位置、缩放
    const springProps = useSpring({
        // 从中心展开
        from: { opacity: 0 },
        to: { opacity: 0.5 },
        config: ANIMATION_CONFIG
    });

    return (
        <animated.mesh position={isExpanded ? position : initialPosition}>
            <sphereGeometry args={[radius ?? 0.1, segments, segments]} />
            <animated.meshBasicMaterial color={'#2196f3'} transparent {...springProps}/>
        </animated.mesh>
    )
}

function MainNodeNeedSpringAnimation({position, unorderedPos, isOrdered, segments, radius, ...props}) {
    // 主节点动画：缩放
    const springProps = useSpring({
        // 从中心展开
        // from: { position, scale: [0.2, 0.2, 0.2] },
        // to: { position, scale: [1, 1, 1] },
        from: { position: isOrdered ? unorderedPos : position },
        to: { position: isOrdered ? position : unorderedPos },
        config: ANIMATION_CONFIG
    });

    return (
        <animated.mesh {...springProps} node={props.node} onClick={props.onClick}>
            <sphereGeometry args={[radius ?? 0.1, segments, segments]} />
            <meshBasicMaterial color={'#fff'} transparent opacity={props.opacity ?? 1}/>
        </animated.mesh>
    )
}

function MainNodeWithoutSpringAnimation({springProps, segments, radius, ...props}) {

    return (
        <mesh {...springProps} node={props.node}>
            <sphereGeometry args={[radius ?? 0.1, segments, segments]} />
            <meshBasicMaterial color={'#fff'} transparent opacity={props.opacity ?? 1}/>
        </mesh>
    )
}