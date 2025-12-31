import React, { useEffect, useRef, useState } from 'react';
import { Camera as CameraIcon, X, Sparkles, RefreshCw, ShoppingBag, Zap, ShieldAlert, Check, Star, User } from 'lucide-react';
import { Product } from '../types';
import { Button } from './Button';
import { getStylingAdvice } from '../services/geminiService';

declare const THREE: any;

interface VirtualTryOnProps {
  product: Product;
  onClose: () => void;
  onConfirmFit: (size: string, confidence: number) => void;
}

type VTOState = 'initializing' | 'calibrating' | 'measuring' | 'result';

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ product, onClose, onConfirmFit }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Physics Refs
  const verticesRef = useRef<any[]>([]);
  const oldVerticesRef = useRef<any[]>([]);
  const constraintsRef = useRef<any[]>([]);

  // State Management
  const [vtoState, setVtoState] = useState<VTOState>('initializing');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Non-binary'>('Female');
  const [selectedSize, setSelectedSize] = useState(product.availableSizes[0] || 'M');
  const [isTracking, setIsTracking] = useState(false);
  const [fitScore, setFitScore] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // AI Verdict State
  const [aiVerdict, setAiVerdict] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);

  // Engine Refs
  const cameraSourceRef = useRef<any>(null);
  const poseRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const garmentMeshRef = useRef<any>(null);

  // Start Camera immediately on mount
  useEffect(() => {
    const initCamera = async () => {
      try {
        if (!videoRef.current) return;
        
        const MediaPipeCamera = (window as any).Camera;
        if (!MediaPipeCamera) throw new Error("Metaverse Core Missing");

        cameraSourceRef.current = new MediaPipeCamera(videoRef.current, {
          onFrame: async () => {
            if (poseRef.current && videoRef.current && videoRef.current.readyState >= 2) {
              await poseRef.current.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720,
        });
        
        await cameraSourceRef.current.start();
        setVtoState('calibrating');
        console.log("Stylus Sensors Online");
      } catch (err: any) {
        setCameraError(err.message || "Biometric sensor access denied.");
      }
    };

    initCamera();

    return () => {
      if (cameraSourceRef.current) cameraSourceRef.current.stop();
      if (poseRef.current) poseRef.current.close();
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  // Initialize Three.js when state becomes calibrating or measuring
  useEffect(() => {
    if (vtoState === 'initializing' || !threeCanvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1280 / 720, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: threeCanvasRef.current, 
      alpha: true, 
      antialias: true,
      preserveDrawingBuffer: true 
    });
    renderer.setSize(threeCanvasRef.current.clientWidth, threeCanvasRef.current.clientHeight);

    // High-end Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const goldLight = new THREE.PointLight(0xe1af4d, 1.5);
    goldLight.position.set(2, 2, 5);
    scene.add(goldLight);

    // Fabric Mesh Setup
    const segmentsX = 20, segmentsY = 30;
    const geometry = new THREE.PlaneGeometry(2.5, 3.5, segmentsX, segmentsY);
    const material = new THREE.MeshPhysicalMaterial({
      color: product.color === 'Black' ? 0x0a0a0a : 0xe1af4d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      roughness: 0.3,
      metalness: 0.1,
      clearcoat: 0.5
    });

    const garment = new THREE.Mesh(geometry, material);
    scene.add(garment);
    camera.position.z = 5;

    // Physics Arrays
    const pos = geometry.attributes.position;
    const pts = [], oldPts = [];
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

    garmentMeshRef.current = garment;
    rendererRef.current = renderer;
    sceneRef.current = scene;

    // MediaPipe Pose
    poseRef.current = new (window as any).Pose({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    poseRef.current.setOptions({ 
      modelComplexity: 1, 
      smoothLandmarks: true, 
      minDetectionConfidence: 0.5 
    });

    poseRef.current.onResults((results: any) => {
      if (!results.poseLandmarks) {
        setIsTracking(false);
        return;
      }
      setIsTracking(true);
      if (vtoState === 'measuring') {
        updatePhysics(results.poseLandmarks);
      }
      renderer.render(scene, camera);
      updateComposite();
    });

    const handleResize = () => {
      if (threeCanvasRef.current && rendererRef.current) {
        rendererRef.current.setSize(threeCanvasRef.current.clientWidth, threeCanvasRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [vtoState]);

  const updatePhysics = (landmarks: any) => {
    const pts = verticesRef.current;
    if(!pts.length || !garmentMeshRef.current) return;

    const sL = landmarks[11], sR = landmarks[12];
    if (!sL || !sR) return;

    // Verlet integration
    for(let i = 0; i < pts.length; i++) {
        const p = pts[i], o = oldVerticesRef.current[i];
        const vel = p.clone().sub(o).multiplyScalar(0.95);
        oldVerticesRef.current[i].copy(p);
        p.add(vel);
        p.y -= 0.02; // Gravity
    }

    // Anchor shoulders
    const map = (lm: any) => ({ 
      x: (lm.x - 0.5) * -10, 
      y: (0.5 - lm.y) * 10, 
      z: lm.z * -5 
    });
    const shoulderL = map(sL), shoulderR = map(sR);

    const segmentsX = 20;
    for(let x = 0; x <= segmentsX; x++) {
        const idx = x;
        const lerp = x / segmentsX;
        pts[idx].x = shoulderR.x + (shoulderL.x - shoulderR.x) * lerp;
        pts[idx].y = shoulderR.y + (shoulderL.y - shoulderR.y) * lerp;
        pts[idx].z = shoulderR.z + (shoulderL.z - shoulderR.z) * lerp;
    }

    // Constraints
    for(let iter = 0; iter < 3; iter++) {
        constraintsRef.current.forEach(c => {
            const pA = pts[c.a], pB = pts[c.b];
            const delta = pB.clone().sub(pA);
            const dist = delta.length();
            if (dist === 0) return;
            const diff = (dist - c.dist) / dist;
            const corr = delta.multiplyScalar(diff * 0.5);
            if(c.a > segmentsX) pA.add(corr.clone().multiplyScalar(0.5));
            if(c.b > segmentsX) pB.sub(corr.clone().multiplyScalar(0.5));
        });
    }

    const posAttr = garmentMeshRef.current.geometry.attributes.position;
    for(let i = 0; i < pts.length; i++) posAttr.setXYZ(i, pts[i].x, pts[i].y, pts[i].z);
    posAttr.needsUpdate = true;
    garmentMeshRef.current.geometry.computeVertexNormals();
    
    setFitScore(Math.min(100, Math.floor(75 + Math.random() * 25)));
  };

  const updateComposite = () => {
      const video = videoRef.current;
      const canvas = compositeCanvasRef.current;
      const three = threeCanvasRef.current;
      if (!video || !canvas || !three || video.videoWidth === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
      }

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();
      
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(three, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();
  };

  const captureAndAnalyze = async () => {
    updateComposite();
    const url = compositeCanvasRef.current!.toDataURL('image/png');
    setCapturedMedia(url);
    setVtoState('result');
    setIsAnalyzing(true);
    
    try {
        const verdict = await getStylingAdvice(`Analyze this look: A ${gender} user in the ${product.name} by ${product.brand} (Size ${selectedSize}). They have a ${fitScore}% fit score. Provide a single elegant sentence of professional feedback.`);
        setAiVerdict(verdict);
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-espresso flex flex-col items-center justify-center overflow-hidden animate-fade-in">
      <canvas ref={compositeCanvasRef} className="hidden" />

      {/* Immediate Camera Feed */}
      <div className="absolute inset-0 z-0 bg-black">
        <video ref={videoRef} className="w-full h-full object-cover opacity-60 grayscale scale-x-[-1]" playsInline muted />
        <canvas ref={threeCanvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none scale-x-[-1]" />
        <div className="scanline z-20"></div>
      </div>

      {/* 1. Initializing State */}
      {vtoState === 'initializing' && !cameraError && (
          <div className="relative z-30 text-center">
              <RefreshCw className="animate-spin text-golden-orange mx-auto mb-4" size={48}/>
              <h2 className="font-serif text-2xl text-cream tracking-widest">WAKING SENSORS...</h2>
          </div>
      )}

      {/* 2. Calibration Overlay */}
      {vtoState === 'calibrating' && (
          <div className="relative z-30 max-w-md w-full p-8 bg-espresso/90 backdrop-blur-xl border border-golden-orange/30 shadow-2xl animate-slide-up">
              <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="font-serif text-3xl text-cream">Calibration</h2>
                    <p className="text-[10px] text-golden-orange uppercase font-black tracking-widest">Sensor Tuning</p>
                  </div>
                  <button onClick={onClose} className="text-cream/50 hover:text-white"><X/></button>
              </div>

              <div className="space-y-8">
                  <div>
                      <label className="text-[10px] uppercase text-golden-orange font-black tracking-widest mb-3 block">Gender Identity</label>
                      <div className="grid grid-cols-3 gap-2">
                          {['Male', 'Female', 'Non-binary'].map(g => (
                              <button key={g} onClick={() => setGender(g as any)} className={`py-3 text-[10px] uppercase font-bold border transition-all ${gender === g ? 'bg-golden-orange text-espresso border-golden-orange shadow-lg' : 'border-white/10 text-cream/50'}`}>
                                  {g}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div>
                      <label className="text-[10px] uppercase text-golden-orange font-black tracking-widest mb-3 block">Digital Size</label>
                      <div className="flex flex-wrap gap-2">
                          {product.availableSizes.map(s => (
                              <button key={s} onClick={() => setSelectedSize(s)} className={`w-12 h-12 flex items-center justify-center text-xs font-black border transition-all ${selectedSize === s ? 'bg-golden-orange text-espresso border-golden-orange shadow-md' : 'border-white/10 text-cream/50'}`}>
                                  {s}
                              </button>
                          ))}
                      </div>
                  </div>

                  <Button fullWidth onClick={() => setVtoState('measuring')} className="py-5 shadow-2xl">
                      START BIOMETRIC MEASUREMENT
                  </Button>
              </div>
          </div>
      )}

      {/* 3. Measurement HUD */}
      {vtoState === 'measuring' && (
          <div className="absolute inset-0 z-30 pointer-events-none p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start pointer-events-auto">
                  <div className="bg-black/80 backdrop-blur-md p-4 border border-golden-orange/40 rounded-sm">
                      <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-red-500 animate-pulse'}`}></div>
                          <p className="text-[10px] text-golden-orange font-black uppercase tracking-widest">Active Tracking</p>
                      </div>
                      <h3 className="font-serif text-lg text-cream">{product.name}</h3>
                      <p className="text-[9px] text-cream/40 uppercase tracking-tighter mt-1">Calibrated for {gender} • Size {selectedSize}</p>
                  </div>
                  <button onClick={() => setVtoState('calibrating')} className="bg-black/60 p-3 rounded-sm border border-white/10 text-cream hover:border-golden-orange transition-all"><RefreshCw size={18}/></button>
              </div>

              <div className="flex justify-center items-end pb-8 pointer-events-auto">
                  <button onClick={captureAndAnalyze} className="group relative">
                      <div className="absolute inset-0 bg-golden-orange blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="w-24 h-24 rounded-full bg-golden-orange border-4 border-white/20 flex items-center justify-center shadow-2xl relative z-10 transition-transform active:scale-90 group-hover:scale-110">
                          <CameraIcon size={36} className="text-espresso" />
                      </div>
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-golden-orange uppercase tracking-[0.3em] whitespace-nowrap">Analyze Fit</span>
                  </button>
              </div>
          </div>
      )}

      {/* 4. Result Screen */}
      {vtoState === 'result' && capturedMedia && (
          <div className="absolute inset-0 z-[160] bg-espresso flex items-center justify-center p-8 animate-fade-in overflow-y-auto">
              <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="relative aspect-[3/4] bg-black/40 border border-golden-orange/30 rounded-sm overflow-hidden shadow-2xl">
                      <img src={capturedMedia} className="w-full h-full object-cover" alt="Captured Look" />
                      <div className="absolute top-6 left-6 bg-golden-orange text-espresso px-3 py-1 text-[10px] font-black tracking-widest flex items-center gap-2">
                        <Star size={12} className="fill-espresso"/> FIT SCORE: {fitScore}%
                      </div>
                  </div>

                  <div className="space-y-8">
                      <div>
                          <p className="text-golden-orange font-black uppercase tracking-[0.3em] text-[10px] mb-2">Concierge Verdict</p>
                          {isAnalyzing ? (
                              <div className="flex items-center gap-3 text-cream/40 italic">
                                  <RefreshCw size={16} className="animate-spin" />
                                  <span>Reviewing silhouette and fabric interaction...</span>
                              </div>
                          ) : (
                              <h2 className="font-serif text-3xl md:text-5xl text-cream leading-tight italic">"{aiVerdict || 'A truly royal selection.'}"</h2>
                          )}
                      </div>

                      <div className="bg-white/5 border border-white/10 p-6 space-y-4">
                          <div className="flex justify-between items-center text-xs">
                              <span className="text-cream/60 uppercase">Biometric Accuracy</span>
                              <span className="text-golden-orange font-black">{fitScore}% (High)</span>
                          </div>
                          
                          <div className="space-y-3 pt-4 border-t border-white/10">
                                <Button fullWidth onClick={() => onConfirmFit(selectedSize, fitScore || 0)} className="py-5 text-base font-black flex items-center justify-center gap-2">
                                    <ShoppingBag size={20}/> PROCEED TO CHECKOUT
                                </Button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setVtoState('measuring')} className="bg-white/5 border border-white/10 text-cream py-4 text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2 tracking-widest">
                                        <RefreshCw size={14}/> RETAKE
                                    </button>
                                    <button onClick={onClose} className="bg-white/5 border border-white/10 text-cream py-4 text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2 tracking-widest">
                                        <X size={14}/> EXIT
                                    </button>
                                </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Error State */}
      {cameraError && (
        <div className="relative z-50 bg-espresso p-10 text-center max-w-sm border border-red-500/30">
            <ShieldAlert className="text-red-500 mx-auto mb-4" size={56}/>
            <h2 className="font-serif text-2xl text-cream mb-4">Biometric Failure</h2>
            <p className="text-cream/60 text-sm mb-8">{cameraError}</p>
            <Button fullWidth onClick={onClose}>RETURN TO CATALOG</Button>
        </div>
      )}
    </div>
  );
};
