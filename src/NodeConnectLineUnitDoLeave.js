import { animated, useSpring } from '@react-spring/three';
import { useEffect, useState, useRef } from 'react';

import { StraightConnectLineDoOpacity, BezierConnectLineDoOpacity } from './ConnectLine';

const ANIMATION_CONFIG = {
    mass: 1,
    tension: 80,
    friction: 20,
    duration: 500
}

// 此组件仅用于消失动画
export function NodeConnectLineUnitDoLeave({id, radius, position, subNodes, connectLines, ...props}) {
    const {segments, childrenVisible, isExpanded} = props.node;
    const [isVisible, setIsVisible] = useState(true);

    const [springProps, api] = useSpring(() => ({
        from: { opacity: 0.5 },
        config: ANIMATION_CONFIG
    }))

    useEffect(() => {
        api.start({
            to: { opacity: 0 },
            onRest: () => setIsVisible(false)
        })

        return () => api.stop();
    }, [api]);

    return isVisible ? (
        <>
            {/* 主节点 */}
            <animated.mesh 
                position={props.isOrdered ? position : props.unorderedPos}
            >
                <sphereGeometry args={[props.radius ?? 0.1, segments, segments]} />
                <animated.meshBasicMaterial 
                    color={'#fff'} 
                    transparent 
                    opacity={springProps.opacity}
                    depthWrite={false}
                />
            </animated.mesh>
            {childrenVisible && <>
                {
                    subNodes.map(node => (
                        <SubNode 
                            key={`${node.id}${props.isOrdered}`} 
                            {...node}
                            segments={segments}
                            initialPosition={props.isOrdered ? [position[0], node.position[1], position[2]] : position} 
                            isExpanded={isExpanded} springProps={springProps}
                        />
                    ))
                }
                {
                    isExpanded && (
                        props.isOrdered ? connectLines.map((line, index) => (
                            line.needStraightLine 
                                ? <StraightConnectLineDoOpacity key={index} {...line} isExpanded={isExpanded} springProps={springProps}/>
                                : <BezierConnectLineDoOpacity key={index} {...line} isExpanded={isExpanded} springProps={springProps}/>
                            )) : connectLines.map((line, index) => (
                            <StraightConnectLineDoOpacity key={index} {...line} isExpanded={isExpanded} springProps={springProps}/>
                        ))
                    )
                }
            </>}
        </>
    ) : null
}

export function SubNode({radius, position, initialPosition, isExpanded, segments, springProps}) {
    const meshConf = { position: (isExpanded ? position : initialPosition), scale: (isExpanded ? [1, 1, 1] : [0.2, 0.2, 0.2]) };

    return (
        <animated.mesh {...meshConf}>
            <sphereGeometry args={[radius ?? 0.1, segments, segments]} />
            <animated.meshBasicMaterial color={'#2196f3'} transparent {...springProps} depthWrite={false}/>
        </animated.mesh>
    )
}