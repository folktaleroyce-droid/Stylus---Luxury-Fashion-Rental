
import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Sparkles, Maximize2, RefreshCw, Info, CheckCircle2, AlertTriangle, ShieldCheck, Video, Share2, ShieldAlert } from 'lucide-react';
import { Product } from '../types';
import { Button } from './Button';
import { ShareModal } from './ShareModal';

declare const Pose: any;
declare const Camera: any;
declare const THREE: any;

interface VirtualTryOnProps {
  product: Product;
  onClose: () => void;
  onConfirmFit: (size: string, confidence: number) => void;
}

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ product, onClose, onConfirmFit }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isInitializing, setIsInitializing] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [fitScore, setFitScore] = useState<number | null>(null);
  const [fitStatus, setFitStatus] = useState<'perfect' | 'tight' | 'loose'>('perfect');
  const [selectedSize, setSelectedSize] = useState(product.availableSizes[0] || 'M');

  // Capture State
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<{ url: string, type: 'photo' | 'video' } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Three.js Scene Refs
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const garmentMeshRef = useRef<any>(null);
  
  // Physics Simulation Data
  const verticesRef = useRef<any[]>([]);
  const oldVerticesRef = useRef<any[]>([]);
  const constraintsRef = useRef<any[]>([]);
  const fabricProfile = useRef({
    stiffness: product.fabricType === 'rigid' ? 0.9 : product.fabricType === 'stretch' ? 0.6 : 0.3,
    damping: product.fabricType === 'stretch' ? 0.98 : 0.9,
    gravity: product.fabricType === 'flowing' ? 0.05 : 0.02,
  });

  const cameraSourceRef = useRef<any>(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsInitializing(true);
      if (videoRef.current && !cameraSourceRef.current) {
        cameraSourceRef.current = new Camera(videoRef.current, {
          onFrame: async () => {
            if (poseRef.current) {
              await poseRef.current.send({ image: videoRef.current! });
            }
          },
          width: 1280,
          height: 720,
        });
        await cameraSourceRef.current.start();
        console.log("Camera started successfully");
      }
    } catch (err) {
      console.error("Error starting camera:", err);
      setCameraError("Camera access denied or unavailable. Please ensure your camera is not being used by another app and you have granted permissions.");
      setIsInitializing(false);
    }
  };

  const poseRef = useRef<any>(null);

  useEffect(() => {
    if (!threeCanvasRef.current) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: threeCanvasRef.current, 
      alpha: true, 
      antialias: true,
      preserveDrawingBuffer: true 
    });
    renderer.setSize(threeCanvasRef.current.clientWidth, threeCanvasRef.current.clientHeight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(1, 1, 2);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xe1af4d, 0.8);
    fillLight.position.set(-1, -0.5, 1);
    scene.add(fillLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    // 3. Fabric Mesh Generation
    const segmentsX = 20;
    const segmentsY = 30;
    const geometry = new THREE.PlaneGeometry(2, 3, segmentsX, segmentsY);
    const pos = geometry.attributes.position;
    for(let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const angle = (x / 2) * Math.PI;
        const radius = 0.5;
        pos.setXYZ(i, Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    }

    const material = new THREE.MeshPhysicalMaterial({
      color: product.color === 'Black' ? 0x0a0a0a : 0xe1af4d,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      roughness: product.fabricType === 'flowing' ? 0.2 : 0.7,
      metalness: 0.1,
      clearcoat: 0.3,
    });

    const garment = new THREE.Mesh(geometry, material);
    scene.add(garment);
    
    const grid = new THREE.GridHelper(10, 20, 0xe1af4d, 0x444444);
    grid.position.y = -2;
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    camera.position.z = 5;
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    garmentMeshRef.current = garment;

    // 4. Physics Initialization
    const pts = [];
    const oldPts = [];
    for(let i = 0; i < pos.count; i++) {
        const p = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
        pts.push(p.clone());
        oldPts.push(p.clone());
    }
    verticesRef.current = pts;
    oldVerticesRef.current = oldPts;

    const cons = [];
    for(let y = 0; y <= segmentsY; y++) {
        for(let x = 0; x <= segmentsX; x++) {
            const idx = y * (segmentsX + 1) + x;
            if(x < segmentsX) cons.push({ a: idx, b: idx + 1, dist: pts[idx].distanceTo(pts[idx + 1]) });
            if(y < segmentsY) cons.push({ a: idx, b: idx + (segmentsX + 1), dist: pts[idx].distanceTo(pts[idx + (segmentsX + 1)]) });
        }
    }
    constraintsRef.current = cons;

    // 5. MediaPipe Integration
    poseRef.current = new Pose({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    poseRef.current.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    poseRef.current.onResults((results: any) => {
      if (!results.poseLandmarks) {
        setIsTracking(false);
        return;
      }
      setIsTracking(true);
      setIsInitializing(false);
      updatePhysics(results.poseLandmarks);
      renderer.render(scene, camera);
      updateComposite();
    });

    startCamera();

    return () => {
      if (rendererRef.current) rendererRef.current.dispose();
      if (poseRef.current) poseRef.current.close();
      if (cameraSourceRef.current) {
        cameraSourceRef.current.stop();
        cameraSourceRef.current = null;
      }
    };
  }, [selectedSize, product.fabricType]);

  const updatePhysics = (landmarks: any) => {
    const pts = verticesRef.current;
    const oldPts = oldVerticesRef.current;
    const cons = constraintsRef.current;
    const profile = fabricProfile.current;
    const mesh = garmentMeshRef.current;
    if(!pts.length || !mesh) return;

    for(let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const o = oldPts[i];
        const vel = p.clone().sub(o).multiplyScalar(profile.damping);
        oldPts[i].copy(p);
        p.add(vel);
        p.y -= profile.gravity;
    }

    const sL = landmarks[11];
    const sR = landmarks[12];
    const hL = landmarks[23];
    const hR = landmarks[24];

    const mapToScene = (lm: any) => ({
        x: (lm.x - 0.5) * -10,
        y: (0.5 - lm.y) * 10,
        z: (lm.z * -5)
    });

    const shoulderL = mapToScene(sL);
    const shoulderR = mapToScene(sR);
    const hipL = mapToScene(hL);
    const hipR = mapToScene(hR);

    const segmentsX = 20;
    const segmentsY = 30;

    for(let x = 0; x <= segmentsX; x++) {
        const idx = x;
        const lerpFactor = x / segmentsX;
        pts[idx].x = shoulderR.x + (shoulderL.x - shoulderR.x) * lerpFactor;
        pts[idx].y = shoulderR.y + (shoulderL.y - shoulderR.y) * lerpFactor;
        pts[idx].z = shoulderR.z + (shoulderL.z - shoulderR.z) * lerpFactor;
    }

    const hipRowIdx = Math.floor(segmentsY * 0.6);
    for(let x = 0; x <= segmentsX; x++) {
        const idx = hipRowIdx * (segmentsX + 1) + x;
        const lerpFactor = x / segmentsX;
        pts[idx].x = hipR.x + (hipL.x - hipR.x) * lerpFactor;
        pts[idx].y = hipR.y + (hipL.y - hipR.y) * lerpFactor;
        pts[idx].z = hipR.z + (hipL.z - hipR.z) * lerpFactor;
    }

    const iterations = product.fabricType === 'rigid' ? 10 : 3;
    for(let iter = 0; iter < iterations; iter++) {
        for(let i = 0; i < cons.length; i++) {
            const { a, b, dist } = cons[i];
            const pA = pts[a];
            const pB = pts[b];
            const delta = pB.clone().sub(pA);
            const currentDist = delta.length();
            const diff = (currentDist - dist) / currentDist;
            const correction = delta.multiplyScalar(diff * profile.stiffness);
            if(a > segmentsX + 1) pA.add(correction.clone().multiplyScalar(0.5));
            if(b > segmentsX + 1) pB.sub(correction.clone().multiplyScalar(0.5));
        }
    }

    const posAttr = mesh.geometry.attributes.position;
    for(let i = 0; i < pts.length; i++) {
        posAttr.setXYZ(i, pts[i].x, pts[i].y, pts[i].z);
    }
    posAttr.needsUpdate = true;
    mesh.geometry.computeVertexNormals();

    const shoulderWidth = Math.abs(shoulderL.x - shoulderR.x);
    const expectedWidth = selectedSize === 'S' ? 1.5 : selectedSize === 'M' ? 1.8 : 2.2;
    const diff_val = Math.abs(shoulderWidth - expectedWidth);
    
    if (diff_val < 0.2) setFitStatus('perfect');
    else if (shoulderWidth > expectedWidth) setFitStatus('tight');
    else setFitStatus('loose');
    
    setFitScore(Math.round(Math.max(0, 100 - (diff_val * 20))));
  };

  const updateComposite = () => {
      if (!compositeCanvasRef.current || !videoRef.current || !threeCanvasRef.current) return;
      const ctx = compositeCanvasRef.current.getContext('2d');
      if (!ctx) return;
      const w = videoRef.current.videoWidth;
      const h = videoRef.current.videoHeight;
      if (w === 0 || h === 0) return;
      compositeCanvasRef.current.width = w;
      compositeCanvasRef.current.height = h;
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, -w, 0, w, h);
      ctx.restore();
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(threeCanvasRef.current, -w, 0, w, h);
      ctx.restore();
  };

  const capturePhoto = () => {
      updateComposite();
      const url = compositeCanvasRef.current!.toDataURL('image/png');
      setCapturedMedia({ url, type: 'photo' });
  };

  const startRecording = () => {
      if (isRecording) return;
      chunksRef.current = [];
      const stream = compositeCanvasRef.current!.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setCapturedMedia({ url, type: 'video' });
          setIsRecording(false);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 5000);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-espresso flex flex-col items-center justify-center p-0 md:p-4 animate-fade-in overflow-hidden">
      
      {capturedMedia && (
        <ShareModal 
          mediaUrl={capturedMedia.url} 
          type={capturedMedia.type} 
          product={product} 
          onClose={() => setCapturedMedia(null)} 
        />
      )}

      <canvas ref={compositeCanvasRef} className="hidden" />

      <div className="absolute inset-0 z-0 bg-black">
        <video ref={videoRef} className="w-full h-full object-cover opacity-60 grayscale scale-x-[-1]" playsInline />
        <canvas ref={threeCanvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none scale-x-[-1]" />
        <div className="scanline z-20"></div>
        
        <div className="absolute inset-0 z-20 pointer-events-none border-[1px] border-golden-orange/20 m-4 flex flex-col justify-between p-6">
           <div className="flex justify-between items-start">
               <div className="bg-black/40 backdrop-blur-md p-4 border border-golden-orange/40 rounded pointer-events-auto">
                   <p className="text-[10px] text-golden-orange uppercase font-bold tracking-widest mb-1 flex items-center gap-2">
                       <Sparkles size={12}/> {product.fabricType?.toUpperCase()} SIMULATION ACTIVE
                   </p>
                   <h2 className="text-xl font-serif text-cream">{product.name}</h2>
                   <p className="text-xs text-cream/50">{product.brand} - {selectedSize}</p>
               </div>
               <button onClick={onClose} className="p-3 bg-black/40 backdrop-blur-md text-cream hover:text-golden-orange border border-white/10 rounded-full pointer-events-auto shadow-xl transition-all hover:scale-110 active:scale-95">
                   <X size={24}/>
               </button>
           </div>
           
           <div className="flex flex-col items-center gap-6 pointer-events-auto mb-20">
               <div className="flex items-center gap-8">
                    <button onClick={startRecording} className={`group flex flex-col items-center gap-2 transition-all ${isRecording ? 'scale-110' : 'hover:scale-105'}`}>
                        <div className={`w-16 h-16 rounded-full border-2 ${isRecording ? 'border-red-500 bg-red-500/20' : 'border-white/50 bg-black/40 hover:border-golden-orange'} flex items-center justify-center transition-all shadow-xl`}>
                            {isRecording ? <div className="w-6 h-6 bg-red-500 rounded-sm animate-pulse" /> : <Video className="text-white group-hover:text-golden-orange" size={24} />}
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-widest ${isRecording ? 'text-red-500' : 'text-cream/50'}`}>
                            {isRecording ? 'Recording...' : 'Video Snap'}
                        </span>
                    </button>

                    <button onClick={capturePhoto} className="group flex flex-col items-center gap-2 transition-all hover:scale-110 active:scale-90">
                        <div className="w-20 h-20 rounded-full border-4 border-golden-orange flex items-center justify-center bg-black/60 backdrop-blur-md shadow-[0_0_40px_rgba(225,175,77,0.4)]">
                            <div className="w-16 h-16 rounded-full border-2 border-golden-orange/30 group-hover:border-golden-orange transition-colors flex items-center justify-center">
                                <Camera className="text-golden-orange" size={32} />
                            </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-golden-orange drop-shadow-md">Capture Look</span>
                    </button>

                    <div className="w-16 h-16 flex flex-col items-center justify-center opacity-40">
                        <Share2 size={24} className="text-cream" />
                        <span className="text-[8px] uppercase font-bold text-cream mt-1">Social</span>
                    </div>
               </div>
           </div>

           <div className="flex justify-between items-end">
               <div className="bg-black/40 backdrop-blur-md p-4 border border-golden-orange/40 rounded w-64 pointer-events-auto">
                   <p className="text-[10px] text-golden-orange uppercase font-bold mb-3">Biometric Fit</p>
                   <div className="space-y-3">
                       <div className="flex justify-between items-center">
                           <span className="text-xs text-cream/70">Simulation Accuracy</span>
                           <span className="text-xs font-bold text-golden-orange">{fitScore ? `${fitScore}%` : '--'}</span>
                       </div>
                       <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-golden-orange transition-all duration-1000" style={{ width: `${fitScore || 0}%` }}></div>
                       </div>
                       <div className="flex items-center gap-2 mt-2">
                           {fitStatus === 'perfect' ? (
                               <><CheckCircle2 size={14} className="text-green-400"/><span className="text-[10px] uppercase text-green-400 font-bold">Perfect Drape</span></>
                           ) : fitStatus === 'tight' ? (
                               <><AlertTriangle size={14} className="text-yellow-400"/><span className="text-[10px] uppercase text-yellow-400 font-bold">Rigid Fit Warning</span></>
                           ) : (
                               <><Info size={14} className="text-blue-400"/><span className="text-[10px] uppercase text-blue-400 font-bold">Flowing Fit</span></>
                           )}
                       </div>
                   </div>
               </div>
               
               <div className="flex flex-col gap-3 pointer-events-auto">
                   <div className="bg-black/40 backdrop-blur-md p-2 border border-white/10 rounded flex flex-col gap-2">
                       {product.availableSizes.map(s => (
                           <button 
                                key={s}
                                onClick={() => setSelectedSize(s)}
                                className={`w-10 h-10 rounded flex items-center justify-center text-xs font-bold transition-all ${selectedSize === s ? 'bg-golden-orange text-espresso shadow-lg scale-110' : 'text-cream/50 hover:bg-white/10 hover:text-white'}`}
                           >
                               {s}
                           </button>
                       ))}
                   </div>
                   <Button onClick={() => onConfirmFit(selectedSize, fitScore || 0)} className="shadow-2xl">
                       Confirm Size & Add to Bag
                   </Button>
               </div>
           </div>
        </div>
      </div>

      {isInitializing && !cameraError && (
          <div className="absolute inset-0 z-[100] bg-espresso flex flex-col items-center justify-center text-center p-8">
              <RefreshCw className="animate-spin text-golden-orange mb-8" size={64}/>
              <h2 className="font-serif text-3xl text-cream mb-4">Initializing Camera Feed</h2>
              <p className="text-cream/60 max-w-sm mb-12">Mapping your silhouette to high-fidelity fabric constraints. If prompted, please allow camera access.</p>
              
              <div className="flex flex-col gap-6 w-full max-w-xs">
                <Button onClick={startCamera} className="flex items-center justify-center gap-3 py-4 text-base">
                   <Camera size={20} /> Grant Camera Access
                </Button>
                <div className="flex items-center justify-center gap-3 text-xs text-golden-orange border border-golden-orange/20 px-6 py-3 rounded-full bg-golden-orange/5">
                    <ShieldCheck size={16}/> Biometric data remains local
                </div>
              </div>
          </div>
      )}

      {cameraError && (
        <div className="absolute inset-0 z-[110] bg-espresso flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <ShieldAlert className="text-red-500" size={48}/>
            </div>
            <h2 className="font-serif text-3xl text-cream mb-4">Camera Connection Failed</h2>
            <p className="text-cream/60 max-w-sm mb-12 leading-relaxed">{cameraError}</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button onClick={startCamera} variant="primary" className="flex-1">Try Again</Button>
                <Button onClick={onClose} variant="outline" className="flex-1">Exit Metaverse</Button>
            </div>
        </div>
      )}

      {!isInitializing && !isTracking && !cameraError && (
          <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center">
              <div className="bg-[#1f0c05] border border-golden-orange p-10 text-center max-w-md shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-sm">
                  <Maximize2 size={64} className="mx-auto text-golden-orange mb-6 animate-pulse" />
                  <h3 className="text-2xl font-serif text-cream mb-3">Target Silhouette Not Found</h3>
                  <p className="text-sm text-cream/50 mb-10 leading-relaxed">Please ensure you are fully visible in the frame so our AI can sync your dimensions.</p>
                  <Button variant="outline" onClick={() => setIsInitializing(true)} className="flex items-center gap-3 mx-auto px-8">
                      <RefreshCw size={18}/> Re-Initialize Sensors
                  </Button>
              </div>
          </div>
      )}
    </div>
  );
};
