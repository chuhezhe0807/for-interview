import { useEffect, useRef } from 'react'
import { useSpring, animated } from '@react-spring/three'
import { useFrame } from '@react-three/fiber'
import {CubicBezierCurve3, Vector3, BufferGeometry} from 'three'

import { ANIMATION_CONFIG } from './NodeConnectLineUnit';

// 曲线连接线(执行位置、缩放动画)
export function BezierConnectLineDoPosition({ start, end, midA, midB, isExpanded }) {
    const initialEndPosition = [start[0], end[1], start[2]];
    
    const lineRef = useRef();
    const animationFlag = useRef(true);
    const points = useRef([new Vector3(0, 0, 0), new Vector3(0, 0, 0)]);

    useEffect(() => {
        animationFlag.current = true;

        return () => {
            animationFlag.current = false;
        };
    }, [isExpanded]);

    const {endPos} = useSpring({
        from: { endPos: isExpanded ? initialEndPosition : end },
        to: { endPos: isExpanded ? end : initialEndPosition },
        config: ANIMATION_CONFIG
    });
  
    useFrame(() => {
        if(animationFlag.current) {
            // 根据 Spring 值动态生成曲线
            const curve = new CubicBezierCurve3(
                new Vector3(...start), // 固定起点
                midA, // 控制点1
                midB,   // 控制点2
                new Vector3(...endPos.get()) // 动态终点
            );
            
            // 生成50个曲线点
            points.current = curve.getPoints(50);
            
            if(lineRef.current) {
                lineRef.current.geometry.setFromPoints(points.current);
                lineRef.current.geometry.attributes.position.needsUpdate = true;
            }

            if(!endPos.isAnimating) {
                animationFlag.current = false;
            }
        }
    });
  
    return (
        <animated.line
            ref={lineRef}
            points={points.current}
        >
            <bufferGeometry />
            <lineBasicMaterial color="#fff" lineWidth={2} transparent opacity={0.5}/>
        </animated.line>
    );
}

// 直线连接线(执行位置、缩放动画)
export function StraightConnectLineDoPosition({ start, end, isExpanded }) {
    const animationFlag = useRef(true);
    const startVector = new Vector3(...start);
    const endVector = new Vector3(...end);
    const geometry = new BufferGeometry();
    geometry.setFromPoints([startVector, endVector]); // 创建基础几何体（预分配内存）

    useEffect(() => {
        animationFlag.current = true;

        return () => {
            animationFlag.current = false;
        };
    }, [isExpanded]);

    // 动画进度控制
    const { progress } = useSpring({
        from: { progress: isExpanded ? 0 : 1 },
        to: { progress: isExpanded ? 1 : 0 },
        config: ANIMATION_CONFIG
    });

    // 使用 useFrame 高效更新顶点
    useFrame(() => {
        if(animationFlag.current) {
            const currentEnd = startVector.clone().lerp(endVector, progress.get());
        
            const positions = geometry.attributes.position.array;
            positions[3] = currentEnd.x;
            positions[4] = currentEnd.y;
            positions[5] = currentEnd.z;
            geometry.attributes.position.needsUpdate = true;

            if(!progress.isAnimating) {
                animationFlag.current = false;
            }
        }
    })

    return (
        <animated.line geometry={geometry}>
            <lineBasicMaterial color="#fff" lineWidth={2} transparent opacity={0.5} />
        </animated.line>
    )
}

// 曲线连接线(执行透明度动画)
export function BezierConnectLineDoOpacity({ start, end, midA, midB, springProps }) {
    // 根据 Spring 值动态生成曲线
    const curve = new CubicBezierCurve3(
        new Vector3(...start), // 固定起点
        midA, // 控制点1
        midB,   // 控制点2
        new Vector3(...end) // 固定终点
    );
    // 生成50个曲线点
    const points = curve.getPoints(50);
    const geometry = new BufferGeometry();
    geometry.setFromPoints(points); // 创建基础几何体（预分配内存）
  
    return (
        <animated.line geometry={geometry}>
            <animated.lineBasicMaterial color="#fff" lineWidth={2} transparent {...springProps} />
        </animated.line>
    );
}

// 直线连接线(执行透明度动画)
export function StraightConnectLineDoOpacity({ start, end, springProps, lineWidth }) {
    const startVector = new Vector3(...start);
    const endVector = new Vector3(...end);
    const geometry = new BufferGeometry();
    geometry.setFromPoints([startVector, endVector]); // 创建基础几何体（预分配内存）

    return (
        <animated.line geometry={geometry}>
            <animated.lineBasicMaterial color="#fff" lineWidth={lineWidth ?? 2} transparent {...springProps} />
        </animated.line>
    )
}