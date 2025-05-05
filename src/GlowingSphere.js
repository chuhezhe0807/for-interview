import { useFrame } from '@react-three/fiber'
import React, { useRef } from 'react'

// 卫星球体参数配置
const SATELLITE_CONFIG = [
    { radius: 0.52, speed: 0.8, color: '#fffed9' },
    { radius: 0.47, speed: 1.2, color: '#fffff8' },
    { radius: 0.42, speed: 1.6, color: '#fec8b6' }
]

// 发光球体的卫星
function Satellite({ config }) {
    const ref = useRef()
    const angle = useRef(Math.random() * Math.PI * 2) // 随机初始角度

    // 动态旋转动画
    useFrame((_, delta) => {
        angle.current += delta * config.speed
        const x = Math.cos(angle.current) * config.radius
        const y = Math.sin(angle.current) * config.radius
        
        // 更新卫星位置
        ref.current.position.set(x, y, 0)
    })

    return (
        <group>
            {/* 卫星球体 */}
            <mesh ref={ref}>
                <sphereGeometry args={[0.08, 32, 32]} />
                <meshStandardMaterial 
                color={config.color}
                emissiveIntensity={2.5}
                roughness={0.15}
                transparent
                />
            </mesh>
        </group>
    )
}

// 唯一的发光球体
export default function GlowingSphere() {
    const sphereRef = useRef()

    // 添加放大缩小动画
    useFrame(({ clock }) => {
        const scale = 1 + Math.sin(clock.elapsedTime * 2) * 0.05
        sphereRef.current.scale.set(scale, scale, scale)
    })

    return (
        <>
          <mesh ref={sphereRef} position={[0, 0, 0]}>
            {/* 基础球体 */}
            <sphereGeometry args={[0.35, 16, 8]} />
            
            {/* 发光材质 */}
            <meshStandardMaterial 
                color="#ffffbe"      // 基础黄色
                emissive="#b78036"  // 自发光颜色
                emissiveIntensity={5}
                metalness={0.4}
                roughness={0.1}
                transparent
                opacity={0.95}
            />
         </mesh>
         {SATELLITE_CONFIG.map((cfg, i) => 
            <Satellite key={i} config={cfg} />
        )}
        </>
    )
}
    