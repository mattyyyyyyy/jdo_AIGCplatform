import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GlassCard3DProps {
  type: 'mic' | 'camera' | 'ghost' | 'human';
  isHovered: boolean;
}

export default function GlassCard3D({ type, isHovered }: GlassCard3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const lightsRef = useRef<THREE.PointLight[]>([]);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Moved camera closer (from 6 to 3.8) to make object fill ~90% of view
    camera.position.z = 3.8; 
    camera.position.y = 0.2; // Slight adjustment to center visually
    cameraRef.current = camera;

    // OPTIMIZATION: Disable antialias for glass effect (blur hides jagged edges), save performance
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    // OPTIMIZATION: Cap pixel ratio
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Materials
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 1.0, // Glass capability
      thickness: 1.5, // Refraction
      ior: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 1.0
    });

    // 3. Geometry Construction based on Type
    // OPTIMIZATION: Reduced segments from 32/32 to 16/16 or 24/24
    const group = new THREE.Group();
    
    if (type === 'mic') {
      // Microphone
      const bodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.8, 16);
      const body = new THREE.Mesh(bodyGeo, glassMaterial);
      body.position.y = -0.5;
      
      const headGeo = new THREE.SphereGeometry(0.6, 24, 24);
      const head = new THREE.Mesh(headGeo, glassMaterial);
      head.position.y = 0.8;
      
      const ringGeo = new THREE.TorusGeometry(0.35, 0.05, 12, 24);
      const ring = new THREE.Mesh(ringGeo, glassMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.3;

      group.add(body, head, ring);

    } else if (type === 'camera') {
      // Camera
      const boxGeo = new THREE.BoxGeometry(1.8, 1.2, 0.6);
      const box = new THREE.Mesh(boxGeo, glassMaterial);
      
      const lensGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 24);
      const lens = new THREE.Mesh(lensGeo, glassMaterial);
      lens.rotation.x = Math.PI / 2;
      lens.position.z = 0.4;
      
      const reel1Geo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
      const reel1 = new THREE.Mesh(reel1Geo, glassMaterial);
      reel1.position.set(-0.5, 0.7, 0);
      
      const reel2Geo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
      const reel2 = new THREE.Mesh(reel2Geo, glassMaterial);
      reel2.position.set(0.5, 0.7, 0);

      group.add(box, lens, reel1, reel2);

    } else if (type === 'ghost') {
      // Ghost (Avatar 2D)
      const headGeo = new THREE.SphereGeometry(0.8, 24, 24, 0, Math.PI * 2, 0, Math.PI/2);
      const head = new THREE.Mesh(headGeo, glassMaterial);
      head.position.y = 0.2;
      
      const bodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.0, 24, 1, true);
      const body = new THREE.Mesh(bodyGeo, glassMaterial);
      body.position.y = -0.3;

      const arm1Geo = new THREE.SphereGeometry(0.25, 16, 16);
      const arm1 = new THREE.Mesh(arm1Geo, glassMaterial);
      arm1.position.set(-0.9, 0, 0.2);

      const arm2Geo = new THREE.SphereGeometry(0.25, 16, 16);
      const arm2 = new THREE.Mesh(arm2Geo, glassMaterial);
      arm2.position.set(0.9, 0.2, 0.2);

      group.add(head, body, arm1, arm2);
      // Make it double sided for the open cylinder
      glassMaterial.side = THREE.DoubleSide;

    } else if (type === 'human') {
      // Chibi Human (Avatar 3D)
      const headGeo = new THREE.SphereGeometry(0.6, 24, 24);
      const head = new THREE.Mesh(headGeo, glassMaterial);
      head.position.y = 0.9;

      const bodyGeo = new THREE.ConeGeometry(0.5, 1.2, 24);
      const body = new THREE.Mesh(bodyGeo, glassMaterial);
      body.position.y = 0;

      // Scarf/Collar
      const scarfGeo = new THREE.TorusGeometry(0.4, 0.15, 12, 24);
      const scarf = new THREE.Mesh(scarfGeo, glassMaterial);
      scarf.rotation.x = Math.PI / 2;
      scarf.position.y = 0.5;

      // Legs
      const legGeo = new THREE.CylinderGeometry(0.15, 0.1, 0.8, 12);
      const leg1 = new THREE.Mesh(legGeo, glassMaterial);
      leg1.position.set(-0.25, -0.8, 0);
      const leg2 = new THREE.Mesh(legGeo, glassMaterial);
      leg2.position.set(0.25, -0.8, 0);

      group.add(head, body, scarf, leg1, leg2);
    }

    scene.add(group);
    meshGroupRef.current = group;

    // 4. Lighting (RGB Setup for Rainbow Refraction)
    const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0xff0000, 0, 10);
    light1.position.set(3, 2, 3);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x00ff00, 0, 10);
    light2.position.set(-3, -2, 3);
    scene.add(light2);

    const light3 = new THREE.PointLight(0x0000ff, 0, 10);
    light3.position.set(0, 3, -3);
    scene.add(light3);
    
    // Key light for base visibility
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(0, 0, 5);
    scene.add(mainLight);

    lightsRef.current = [light1, light2, light3];

    // 5. Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (meshGroupRef.current) {
        // Idle Animation
        meshGroupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.1;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // DISPOSAL logic to prevent memory leaks
      glassMaterial.dispose();
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
        }
      });
      renderer.dispose();
    };
  }, [type]);

  // Handle Hover Effects via Refs to avoid re-creating scene
  useEffect(() => {
    let targetIntensity = isHovered ? 8.0 : 0.0; // Colorful lights
    let targetMainIntensity = isHovered ? 0.5 : 2.0; // Dim main light on hover to emphasize colors
    
    const interval = setInterval(() => {
      if (!lightsRef.current.length) return;
      
      // Lerp Intensity
      const l1 = lightsRef.current[0];
      l1.intensity += (targetIntensity - l1.intensity) * 0.1;
      lightsRef.current[1].intensity = l1.intensity;
      lightsRef.current[2].intensity = l1.intensity;

      // Rotate Object
      if (meshGroupRef.current) {
        if (isHovered) {
             meshGroupRef.current.rotation.y += 0.02;
             meshGroupRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.2;
        } else {
             meshGroupRef.current.rotation.y += (0 - meshGroupRef.current.rotation.y) * 0.1;
             meshGroupRef.current.rotation.x += (0 - meshGroupRef.current.rotation.x) * 0.1;
        }
      }
    }, 16);

    return () => clearInterval(interval);

  }, [isHovered]);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0 pointer-events-none" />
  );
}