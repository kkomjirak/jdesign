"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getAssetPath } from "@/lib/basePath";

interface Model3DViewerProps {
  modelUrl: string;
  projectTitle: string;
}

export default function Model3DViewer({ modelUrl, projectTitle }: Model3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const initialCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3());

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadedMB, setLoadedMB] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const userDisabledAutoRotateRef = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle Auto Rotate
  const toggleAutoRotate = () => {
    if (controlsRef.current) {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
      const nextState = !isAutoRotating;
      userDisabledAutoRotateRef.current = !nextState;
      controlsRef.current.autoRotate = nextState;
      setIsAutoRotating(nextState);
    }
  };

  // Reset Camera View
  const resetCamera = useCallback(() => {
    if (controlsRef.current && cameraRef.current) {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
      cameraRef.current.position.copy(initialCamPosRef.current);
      controlsRef.current.target.set(0, 0, 0);
      if (!userDisabledAutoRotateRef.current) {
        controlsRef.current.autoRotate = true;
        setIsAutoRotating(true);
      }
      controlsRef.current.update();
    }
  }, []);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    setIsLoading(true);
    setLoadProgress(0);
    setLoadError(null);

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = !userDisabledAutoRotateRef.current;
    controls.autoRotateSpeed = 1.8;
    controls.maxPolarAngle = Math.PI / 2 + 0.25; // 약간 아래까지만 허용

    // 사용자가 마우스/터치로 직접 조작 시 일시 정지 및 손을 떼었을 때 자동 회전 복구
    const handleStart = () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
      controls.autoRotate = false;
    };

    const handleEnd = () => {
      // 사용자가 버튼으로 명시적으로 끈 상태가 아니면 인터랙션 종료 후 1.5초 뒤 자동 회전 재개
      if (!userDisabledAutoRotateRef.current) {
        if (resumeTimeoutRef.current) {
          clearTimeout(resumeTimeoutRef.current);
        }
        resumeTimeoutRef.current = setTimeout(() => {
          if (!userDisabledAutoRotateRef.current && controlsRef.current) {
            controlsRef.current.autoRotate = true;
            setIsAutoRotating(true);
          }
        }, 1500);
      }
    };

    controls.addEventListener("start", handleStart);
    controls.addEventListener("end", handleEnd);

    // 5. Lighting (Studio Lighting Setup)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(6, 10, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xdbeafe, 1.2);
    dirLight2.position.set(-6, 6, -6);
    scene.add(dirLight2);

    const dirLight3 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight3.position.set(0, -6, 0);
    scene.add(dirLight3);

    // 6. Load GLTF / GLB Model
    const loader = new GLTFLoader();
    const assetUrl = getAssetPath(modelUrl);

    let loadedModel: THREE.Group | null = null;

    loader.load(
      assetUrl,
      (gltf) => {
        loadedModel = gltf.scene;

        // Auto Center and Scale calculation
        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        loadedModel.position.x -= center.x;
        loadedModel.position.y -= center.y;
        loadedModel.position.z -= center.z;

        scene.add(loadedModel);

        // Fit camera to object bounds
        const fovRad = (camera.fov * Math.PI) / 180;
        const fitHeightDist = maxDim / (2 * Math.atan(fovRad / 2));
        const fitWidthDist = fitHeightDist / camera.aspect;
        const dist = 1.35 * Math.max(fitHeightDist, fitWidthDist);

        camera.position.set(dist * 0.85, dist * 0.5, dist * 1.15);
        camera.near = dist / 100;
        camera.far = dist * 100;
        camera.updateProjectionMatrix();

        initialCamPosRef.current.copy(camera.position);

        controls.target.set(0, 0, 0);
        controls.minDistance = dist * 0.25;
        controls.maxDistance = dist * 3.5;

        // 모델 로딩 완료 후 기본설정으로 자동회전 확실히 활성화
        if (!userDisabledAutoRotateRef.current) {
          controls.autoRotate = true;
          setIsAutoRotating(true);
        }

        controls.update();

        setIsLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadProgress(pct);
        } else {
          setLoadedMB((xhr.loaded / (1024 * 1024)).toFixed(1));
        }
      },
      (error) => {
        console.error("Error loading 3D model:", error);
        setLoadError("3D 모델을 불러오는 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    );

    // 7. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // 8. Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Cleanup
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
      cancelAnimationFrame(animationFrameId);
      controls.removeEventListener("start", handleStart);
      controls.removeEventListener("end", handleEnd);
      resizeObserver.disconnect();

      if (loadedModel) {
        scene.remove(loadedModel);
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else if (child.material) {
              child.material.dispose();
            }
          }
        });
      }

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  return (
    <div className="w-full mt-16 md:mt-24">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-8 md:mb-12 pt-10 border-t border-[#1D1D1F]/10 dark:border-[#F5F5F7]/10">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0066CC] mb-1">
          3D Interactive Model
        </span>
        <h2 className="text-2xl md:text-4xl font-[300] tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] font-product">
          3D 모델링 뷰어
        </h2>
        <p className="mt-2 text-xs md:text-sm text-[#1D1D1F]/60 dark:text-[#F5F5F7]/60">
          마우스 드래그 또는 터치로 제품을 360° 자유롭게 회전하고 확대해 살펴보실 수 있습니다.
        </p>
      </div>

      {/* 3D Canvas Box */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/10] max-h-[640px] rounded-[12px] overflow-hidden bg-gradient-to-b from-[#FFFFFF] to-[#ECECEE] dark:from-[#1C1C1E] dark:to-[#121214] border border-[#1D1D1F]/10 dark:border-white/10 shadow-sm">
        
        {/* Three.js Container */}
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Loading Overlay */}
        {isLoading && !loadError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md transition-opacity duration-300">
            <div className="w-12 h-12 border-3 border-[#0066CC]/20 border-t-[#0066CC] rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
              3D 모델 데이터를 불러오는 중...
            </p>
            <p className="text-xs text-[#1D1D1F]/50 dark:text-[#F5F5F7]/50 mt-1 font-mono">
              {loadProgress > 0 ? `${loadProgress}%` : loadedMB ? `${loadedMB} MB 로드됨` : "잠시만 기다려주세요"}
            </p>
            {loadProgress > 0 && (
              <div className="w-48 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-[#0066CC] transition-all duration-200 rounded-full"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Error Overlay */}
        {loadError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-white/90 dark:bg-[#1C1C1E]/90">
            <span className="text-3xl mb-2">⚠️</span>
            <p className="text-sm font-medium text-red-500 mb-1">{loadError}</p>
            <p className="text-xs text-[#1D1D1F]/50 dark:text-[#F5F5F7]/50">
              파일을 불러오는 과정에 일시적인 지연이 발생했습니다.
            </p>
          </div>
        )}

        {/* Top Floating Guide & Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 dark:bg-black/70 backdrop-blur-md border border-[#1D1D1F]/5 dark:border-white/10 text-[11px] text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80 shadow-2xs">
            <span>🖱️</span>
            <span className="hidden sm:inline">좌클릭 드래그: 회전 | 휠: 줌</span>
            <span className="sm:hidden">터치 드래그: 회전 | 핀치: 줌</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Auto Rotate Toggle */}
            <button
              type="button"
              onClick={toggleAutoRotate}
              title={isAutoRotating ? "자동 회전 멈추기" : "자동 회전 켜기"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border transition-all cursor-pointer shadow-2xs ${
                isAutoRotating
                  ? "bg-[#0066CC] text-white border-[#0066CC]"
                  : "bg-white/85 dark:bg-black/70 text-[#1D1D1F] dark:text-[#F5F5F7] border-[#1D1D1F]/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <span className="text-[11px]">{isAutoRotating ? "↻" : "▷"}</span>
              <span>{isAutoRotating ? "자동 회전 중" : "자동 회전"}</span>
            </button>

            {/* Reset Camera Button */}
            <button
              type="button"
              onClick={resetCamera}
              title="원래 시점으로 초기화"
              className="p-1.5 px-3 rounded-full text-xs font-medium bg-white/85 dark:bg-black/70 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#1D1D1F] dark:text-[#F5F5F7] backdrop-blur-md border border-[#1D1D1F]/10 dark:border-white/10 transition-all cursor-pointer shadow-2xs"
            >
              시점 리셋
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "전체화면 종료" : "전체화면으로 보기"}
              className="p-1.5 px-2.5 rounded-full text-xs font-medium bg-white/85 dark:bg-black/70 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#1D1D1F] dark:text-[#F5F5F7] backdrop-blur-md border border-[#1D1D1F]/10 dark:border-white/10 transition-all cursor-pointer shadow-2xs"
            >
              {isFullscreen ? "축소" : "전체화면"}
            </button>
          </div>
        </div>

        {/* Bottom Model Name Tag */}
        <div className="absolute bottom-4 left-4 pointer-events-none z-10">
          <span className="px-3 py-1 rounded-md text-[11px] font-mono text-[#1D1D1F]/50 dark:text-[#F5F5F7]/50 bg-white/60 dark:bg-black/50 backdrop-blur-xs">
            {projectTitle} • GLB
          </span>
        </div>

      </div>
    </div>
  );
}
