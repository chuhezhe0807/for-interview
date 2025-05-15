import {DoubleSide, Vector3, MathUtils, Quaternion} from 'three'
import { Ring } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useLayoutEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const Y_INDEX_MAP = {
    0: -1.5,
    1: -1.7,
    2: -2,
}

export const StarRing = forwardRef((props, ref) => {
    const circleCount = 3;
    const baseRadius = 1.5;
    const spacing = 0.8;

    const { camera } = useThree();
    const ringRef = useRef();

    const rotateRing = () => {
        // const ring = ringRef.current
        // const camPos = new Vector3()
        // camera.getWorldPosition(camPos) // 获取摄像机世界坐标
    
        // // Step 1: 基础朝向（Z轴指向摄像机）
        // ring.lookAt(camPos)
    
        // // Step 2: 计算摄像机右方向（用于绕此轴旋转）
        // const camRight = new Vector3()
        // camera.getWorldDirection(camRight) // 摄像机视线方向
        // camRight.cross(camera.up).normalize() // 计算摄像机右方向（视线方向 × 上方向）
    
        // // Step 3: 将摄像机右方向转换到环的本地坐标系
        // const localCamRight = ring.worldToLocal(camRight.clone().add(ring.position))
        // const rotationAxis = localCamRight.normalize()
    
        // // Step 4: 绕本地坐标系中的摄像机右方向轴旋转-80度
        // const quaternion = new Quaternion()
        // quaternion.setFromAxisAngle(rotationAxis, MathUtils.degToRad(-80))
        // ring.quaternion.multiply(quaternion);
    }

    useLayoutEffect(() => {
        rotateRing();
    }, []);

    useImperativeHandle(ref, () => ({
        rotateRing() {
            rotateRing();
        },
    }), []);

    return (
        <group ref={ringRef}>
            {Array.from({ length: circleCount }).map((_, index) => (
                <Ring
                    key={index}
                    args={[baseRadius + index * spacing - 0.01, baseRadius + index * spacing, 64]} // 参数: [半径, 分段数]
                    // position={[0, 0, 0]} // 共享同一中心点
                    position={[0, Y_INDEX_MAP[index], 0]} // 共享同一中心点
                    rotation={[-Math.PI/2, 0, 0]} // 平铺在XZ平面
                >
                    <meshBasicMaterial color={'#888585'} side={DoubleSide}/>
                </Ring>
            ))}
      </group>
    )
})
