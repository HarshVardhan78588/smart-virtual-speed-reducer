import React, { useEffect, useRef } from 'react';
import { SpeedZone, VehicleType } from '../../types/vehicle';

interface Vehicle3DSceneProps {
  vehicleType: VehicleType;
  currentSpeed: number; // km/h
  allowedSpeed: number;
  distanceToZone: number; // meters
  currentZone: SpeedZone | null;
  upcomingZone: SpeedZone | null;
  isInsideZone: boolean;
  controlledSpeedActive: boolean;
  overrideActive: boolean;
}

export const Vehicle3DScene: React.FC<Vehicle3DSceneProps> = ({
  vehicleType,
  currentSpeed,
  allowedSpeed,
  distanceToZone,
  upcomingZone,
  isInsideZone,
  controlledSpeedActive,
  overrideActive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const roadOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = (now: number) => {
      const delta = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      // Advance road texture based on current speed (km/h converted to virtual speed factor)
      const speedFactor = (currentSpeed / 3.6) * 18; // px/sec
      roadOffsetRef.current = (roadOffsetRef.current + speedFactor * delta) % 120;

      // Background: Clean warm light ambient sky/horizon
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#E8EDF2'); // Crisp cool morning light
      skyGrad.addColorStop(0.38, '#F1F4F8');
      skyGrad.addColorStop(0.42, '#E2E8F0');
      skyGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Horizon line
      const horizonY = height * 0.38;

      // Distant minimalist architectural silhouette
      ctx.fillStyle = '#CBD5E1';
      const buildingCount = 12;
      const bWidth = width / buildingCount;
      for (let i = 0; i < buildingCount; i++) {
        const bH = 20 + ((i * 37) % 35);
        ctx.fillRect(i * bWidth, horizonY - bH, bWidth - 4, bH);
      }

      // Subtle distant trees / green landscape band
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let x = 0; x <= width; x += 40) {
        const treeH = 8 + Math.sin(x * 0.05) * 5;
        ctx.lineTo(x, horizonY - treeH);
      }
      ctx.lineTo(width, horizonY);
      ctx.closePath();
      ctx.fill();

      // Terrain / Grass roadside fields
      const leftField = ctx.createLinearGradient(0, horizonY, 0, height);
      leftField.addColorStop(0, '#E2E8F0');
      leftField.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = leftField;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Perspective Road geometry
      const roadTopWidth = width * 0.16;
      const roadBottomWidth = width * 0.72;
      const roadCenterX = width * 0.5;

      const roadTopLeft = roadCenterX - roadTopWidth / 2;
      const roadTopRight = roadCenterX + roadTopWidth / 2;
      const roadBottomLeft = roadCenterX - roadBottomWidth / 2;
      const roadBottomRight = roadCenterX + roadBottomWidth / 2;

      // Road Surface (High quality asphalt with slight gradient)
      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      roadGrad.addColorStop(0, '#334155');
      roadGrad.addColorStop(1, '#1E293B');

      ctx.beginPath();
      ctx.moveTo(roadTopLeft, horizonY);
      ctx.lineTo(roadTopRight, horizonY);
      ctx.lineTo(roadBottomRight, height);
      ctx.lineTo(roadBottomLeft, height);
      ctx.closePath();
      ctx.fillStyle = roadGrad;
      ctx.fill();

      // Road Shoulders / Curbs
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#94A3B8';
      ctx.beginPath();
      ctx.moveTo(roadTopLeft, horizonY);
      ctx.lineTo(roadBottomLeft, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(roadTopRight, horizonY);
      ctx.lineTo(roadBottomRight, height);
      ctx.stroke();

      // Road Lane Markings (Dashed central line with perspective scaling)
      const numStripes = 14;
      ctx.strokeStyle = '#FFFFFF';

      for (let i = 0; i < numStripes; i++) {
        // Perspective distribution from t=0 (horizon) to t=1 (bottom)
        const t1 = Math.pow((i + roadOffsetRef.current / 120) / numStripes, 2.2);
        const t2 = Math.pow((i + 0.45 + roadOffsetRef.current / 120) / numStripes, 2.2);

        if (t1 > 1 || t2 > 1 || t1 < 0.05) continue;

        const y1 = horizonY + (height - horizonY) * t1;
        const y2 = horizonY + (height - horizonY) * t2;

        // Lane width at this perspective
        const curLineWidth = 1.5 + t1 * 6;
        ctx.lineWidth = curLineWidth;

        ctx.beginPath();
        ctx.moveTo(roadCenterX, y1);
        ctx.lineTo(roadCenterX, y2);
        ctx.stroke();
      }

      // Modern Roadside Lamp Posts (Clean minimal ADAS styling)
      const lampCount = 6;
      for (let j = 0; j < lampCount; j++) {
        const lt = Math.pow((j + (roadOffsetRef.current / 120) * 0.8) / lampCount, 2.0);
        if (lt > 0.95 || lt < 0.08) continue;
        const ly = horizonY + (height - horizonY) * lt;
        const roadWAtY = roadTopWidth + (roadBottomWidth - roadTopWidth) * lt;
        const postX = roadCenterX + roadWAtY / 2 + 14 * (1 + lt * 2);
        const postH = 25 + lt * 80;

        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1 + lt * 2;
        ctx.beginPath();
        ctx.moveTo(postX, ly);
        ctx.lineTo(postX, ly - postH);
        ctx.lineTo(postX - 12 * lt, ly - postH);
        ctx.stroke();

        // Lamp head soft glow
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(postX - 12 * lt, ly - postH, 2 + lt * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // ==========================================
      // VIRTUAL SPEED ZONE ON ROAD SURFACE
      // Note: NO physical hump geometry. It is a digital projection!
      // ==========================================
      const hasUpcoming = upcomingZone || isInsideZone;
      const zoneInfo = upcomingZone || (isInsideZone ? { allowedSpeed, reason: 'Active Virtual Zone', type: 'permanent' } : null);

      if (hasUpcoming && zoneInfo) {
        // Map distanceToZone (0 to 600m) into perspective t (0.1 to 0.85)
        // If inside zone, distanceToZone is 0 or negative
        const clampedDist = Math.max(0, Math.min(distanceToZone, 600));
        // Inverted: closer distance = higher t (closer to vehicle at t ~ 0.72)
        const zoneT = isInsideZone ? 0.88 : Math.max(0.12, 0.72 - (clampedDist / 600) * 0.58);

        const zoneY = horizonY + (height - horizonY) * zoneT;
        const curRoadW = roadTopWidth + (roadBottomWidth - roadTopWidth) * zoneT;
        const zLeft = roadCenterX - curRoadW / 2;
        const zRight = roadCenterX + curRoadW / 2;

        const isTemporary = zoneInfo.type === 'temporary';
        const zoneColor = isTemporary ? 'rgba(217, 119, 6, ' : 'rgba(13, 148, 136, '; // Amber for temp, Teal for permanent

        // 1. Digital Virtual Speed Zone Translucent Surface Marker
        const zoneBandHeight = 16 + zoneT * 40;
        const zoneSurfaceGrad = ctx.createLinearGradient(0, zoneY - zoneBandHeight / 2, 0, zoneY + zoneBandHeight / 2);
        zoneSurfaceGrad.addColorStop(0, zoneColor + '0.05)');
        zoneSurfaceGrad.addColorStop(0.5, zoneColor + (isInsideZone ? '0.35)' : '0.22)'));
        zoneSurfaceGrad.addColorStop(1, zoneColor + '0.05)');

        ctx.fillStyle = zoneSurfaceGrad;
        ctx.fillRect(zLeft, zoneY - zoneBandHeight / 2, curRoadW, zoneBandHeight);

        // 2. High-Tech Boundary Transverse Scan Lines
        ctx.strokeStyle = zoneColor + '0.85)';
        ctx.lineWidth = 2 + zoneT * 3;
        ctx.beginPath();
        ctx.moveTo(zLeft, zoneY);
        ctx.lineTo(zRight, zoneY);
        ctx.stroke();

        // 3. Virtual Boundary Sensor Markers on both curbs (Digital Pylons)
        const pylonH = 14 + zoneT * 36;
        ctx.fillStyle = isTemporary ? '#D97706' : '#0D9488';
        // Left pylon
        ctx.fillRect(zLeft - 6, zoneY - pylonH, 4 + zoneT * 3, pylonH);
        // Right pylon
        ctx.fillRect(zRight + 2, zoneY - pylonH, 4 + zoneT * 3, pylonH);

        // Digital holographic beam above the zone
        ctx.strokeStyle = zoneColor + '0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(zLeft - 4, zoneY - pylonH);
        ctx.lineTo(zRight + 4, zoneY - pylonH);
        ctx.stroke();
        ctx.setLineDash([]);

        // 4. Digital Speed Stencil on Road Surface (e.g., "30 ZONE" or "20 HUMP")
        if (zoneT > 0.25) {
          ctx.save();
          ctx.translate(roadCenterX, zoneY);
          ctx.scale(1, 0.45); // Road surface perspective foreshortening

          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.round(14 + zoneT * 26)}px 'Plus Jakarta Sans', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const label = isInsideZone
            ? `ACTIVE · ${allowedSpeed} km/h`
            : `${zoneInfo.allowedSpeed} km/h ZONE · ${Math.round(distanceToZone)}m`;
          ctx.fillText(label, 0, -8);

          // Subtle digital sensor symbol
          ctx.font = `${Math.round(10 + zoneT * 14)}px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillStyle = isTemporary ? '#FDE68A' : '#99F6E4';
          ctx.fillText(`◇ SMART VIRTUAL SPEED REDUCER`, 0, 18);
          ctx.restore();
        }
      }

      // ==========================================
      // VEHICLE (Realistic Digital Twin Representation)
      // ==========================================
      const vehicleY = height * 0.76;
      const vehicleX = roadCenterX;

      if (vehicleType === 'car') {
        // Modern Crossover / Sedan Digital Twin (Rear 3/4 Perspective)
        const carW = Math.min(width * 0.28, 190);
        const carH = carW * 0.62;

        // Vehicle Soft Cast Shadow
        const shadowGrad = ctx.createRadialGradient(
          vehicleX,
          vehicleY + carH * 0.42,
          10,
          vehicleX,
          vehicleY + carH * 0.42,
          carW * 0.65
        );
        shadowGrad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
        shadowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(vehicleX, vehicleY + carH * 0.42, carW * 0.6, carH * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wheels
        ctx.fillStyle = '#0F172A';
        const wheelW = carW * 0.14;
        const wheelH = carH * 0.35;
        // Left wheel
        ctx.beginPath();
        ctx.roundRect(vehicleX - carW * 0.48, vehicleY + carH * 0.15, wheelW, wheelH, 4);
        ctx.fill();
        // Right wheel
        ctx.beginPath();
        ctx.roundRect(vehicleX + carW * 0.48 - wheelW, vehicleY + carH * 0.15, wheelW, wheelH, 4);
        ctx.fill();

        // Car Lower Body (Sleek aerodynamic shell)
        const bodyGrad = ctx.createLinearGradient(0, vehicleY - carH * 0.4, 0, vehicleY + carH * 0.4);
        bodyGrad.addColorStop(0, '#FFFFFF'); // Clean automotive silver-white
        bodyGrad.addColorStop(0.5, '#E2E8F0');
        bodyGrad.addColorStop(1, '#CBD5E1');

        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;

        // Rear Bumper & Main Body Silhouette
        ctx.beginPath();
        ctx.moveTo(vehicleX - carW * 0.44, vehicleY + carH * 0.35);
        ctx.lineTo(vehicleX - carW * 0.46, vehicleY);
        ctx.lineTo(vehicleX - carW * 0.38, vehicleY - carH * 0.1);
        ctx.lineTo(vehicleX - carW * 0.32, vehicleY - carH * 0.42);
        ctx.lineTo(vehicleX + carW * 0.32, vehicleY - carH * 0.42);
        ctx.lineTo(vehicleX + carW * 0.38, vehicleY - carH * 0.1);
        ctx.lineTo(vehicleX + carW * 0.46, vehicleY);
        ctx.lineTo(vehicleX + carW * 0.44, vehicleY + carH * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Greenhouse / Cabin Glass
        const glassGrad = ctx.createLinearGradient(0, vehicleY - carH * 0.42, 0, vehicleY - carH * 0.08);
        glassGrad.addColorStop(0, '#1E293B');
        glassGrad.addColorStop(1, '#334155');
        ctx.fillStyle = glassGrad;

        ctx.beginPath();
        ctx.moveTo(vehicleX - carW * 0.28, vehicleY - carH * 0.38);
        ctx.lineTo(vehicleX + carW * 0.28, vehicleY - carH * 0.38);
        ctx.lineTo(vehicleX + carW * 0.35, vehicleY - carH * 0.12);
        ctx.lineTo(vehicleX - carW * 0.35, vehicleY - carH * 0.12);
        ctx.closePath();
        ctx.fill();

        // Rear Window subtle reflection line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(vehicleX - carW * 0.22, vehicleY - carH * 0.34);
        ctx.lineTo(vehicleX - carW * 0.12, vehicleY - carH * 0.16);
        ctx.stroke();

        // License Plate / System Unit Identification
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1;
        const plateW = carW * 0.32;
        const plateH = carH * 0.15;
        ctx.beginPath();
        ctx.roundRect(vehicleX - plateW / 2, vehicleY + carH * 0.16, plateW, plateH, 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.font = `600 ${Math.round(plateH * 0.55)}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SVSR-DT-01', vehicleX, vehicleY + carH * 0.235);

        // LED Tail Lights (Dynamic responsive illumination)
        const isBraking = controlledSpeedActive || (currentSpeed > allowedSpeed && distanceToZone < 250);
        const tailLightColor = isBraking ? '#EF4444' : '#DC2626';
        const lightGlow = isBraking ? 'rgba(239, 68, 68, 0.65)' : 'rgba(220, 38, 38, 0.35)';

        // Left Tail Light
        ctx.fillStyle = tailLightColor;
        ctx.beginPath();
        ctx.roundRect(vehicleX - carW * 0.44, vehicleY + carH * 0.02, carW * 0.22, carH * 0.1, 2);
        ctx.fill();

        // Right Tail Light
        ctx.beginPath();
        ctx.roundRect(vehicleX + carW * 0.22, vehicleY + carH * 0.02, carW * 0.22, carH * 0.1, 2);
        ctx.fill();

        // Controlled Speed Deceleration Pulse
        if (controlledSpeedActive) {
          ctx.strokeStyle = 'rgba(13, 148, 136, 0.8)';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(vehicleX, vehicleY + carH * 0.1, carW * 0.6, Math.PI * 0.8, Math.PI * 2.2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Tail Light Glow when active
        if (isBraking) {
          const glowGrad = ctx.createRadialGradient(vehicleX, vehicleY + carH * 0.07, 10, vehicleX, vehicleY + carH * 0.07, carW * 0.6);
          glowGrad.addColorStop(0, lightGlow);
          glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(vehicleX, vehicleY + carH * 0.07, carW * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Motorcycle / Two-Wheeler Digital Twin
        const bikeW = Math.min(width * 0.18, 110);
        const bikeH = bikeW * 1.3;

        // Shadow
        const mShadow = ctx.createRadialGradient(vehicleX, vehicleY + bikeH * 0.35, 6, vehicleX, vehicleY + bikeH * 0.35, bikeW * 0.6);
        mShadow.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
        mShadow.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = mShadow;
        ctx.beginPath();
        ctx.ellipse(vehicleX, vehicleY + bikeH * 0.35, bikeW * 0.5, bikeH * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rear Tire
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.roundRect(vehicleX - bikeW * 0.14, vehicleY + bikeH * 0.12, bikeW * 0.28, bikeH * 0.28, 6);
        ctx.fill();

        // Exhaust & Swingarm
        ctx.fillStyle = '#64748B';
        ctx.fillRect(vehicleX + bikeW * 0.12, vehicleY + bikeH * 0.16, bikeW * 0.14, bikeH * 0.14);

        // Bodywork & Seat
        ctx.fillStyle = '#E2E8F0';
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(vehicleX - bikeW * 0.25, vehicleY + bikeH * 0.1);
        ctx.lineTo(vehicleX - bikeW * 0.22, vehicleY - bikeH * 0.15);
        ctx.lineTo(vehicleX - bikeW * 0.15, vehicleY - bikeH * 0.35);
        ctx.lineTo(vehicleX + bikeW * 0.15, vehicleY - bikeH * 0.35);
        ctx.lineTo(vehicleX + bikeW * 0.22, vehicleY - bikeH * 0.15);
        ctx.lineTo(vehicleX + bikeW * 0.25, vehicleY + bikeH * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Rider silhouette
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        // Helmet
        ctx.arc(vehicleX, vehicleY - bikeH * 0.5, bikeW * 0.18, 0, Math.PI * 2);
        ctx.fill();
        // Shoulders / Jacket
        ctx.beginPath();
        ctx.moveTo(vehicleX - bikeW * 0.38, vehicleY - bikeH * 0.25);
        ctx.lineTo(vehicleX + bikeW * 0.38, vehicleY - bikeH * 0.25);
        ctx.lineTo(vehicleX + bikeW * 0.25, vehicleY - bikeH * 0.05);
        ctx.lineTo(vehicleX - bikeW * 0.25, vehicleY - bikeH * 0.05);
        ctx.closePath();
        ctx.fill();

        // Tail Light
        const isBraking = controlledSpeedActive || (currentSpeed > allowedSpeed && distanceToZone < 250);
        ctx.fillStyle = isBraking ? '#EF4444' : '#DC2626';
        ctx.beginPath();
        ctx.roundRect(vehicleX - bikeW * 0.16, vehicleY + bikeH * 0.02, bikeW * 0.32, bikeH * 0.08, 3);
        ctx.fill();
      }

      // Emergency Override Active Banner in 3D Scene
      if (overrideActive) {
        ctx.fillStyle = 'rgba(220, 38, 38, 0.9)';
        ctx.beginPath();
        ctx.roundRect(width * 0.5 - 130, 16, 260, 30, 6);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('□ EMERGENCY OVERRIDE ACTIVE', width * 0.5, 31);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [vehicleType, currentSpeed, allowedSpeed, distanceToZone, upcomingZone, isInsideZone, controlledSpeedActive, overrideActive]);

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-xl bg-slate-900 border border-slate-700/60 shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Subtle Digital Twin Camera Stamp */}
      <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-700/60 backdrop-blur-xs flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        <span>VIRTUAL TWIN PERSPECTIVE</span>
      </div>
    </div>
  );
};
