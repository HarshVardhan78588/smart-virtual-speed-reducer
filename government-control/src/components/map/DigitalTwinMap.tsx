import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Plus,
  Layers,
  Eye,
  Sliders,
  Radio,
  Car,
  ShieldAlert,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Trash2,
  Edit,
  MousePointer,
  MapPin,
  Maximize2,
  Minimize2,
  Gauge,
  MousePointerClick,
  Undo2,
  RefreshCw,
  ArrowRight,
  Info
} from 'lucide-react';
import { useTrafficSystem } from '../../context/TrafficSystemContext';
import { SpeedZone, VehicleTelemetry, ZoneType } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ZoneConfigModal } from './ZoneConfigModal';

interface DigitalTwinMapProps {
  isFullScreen?: boolean;
  className?: string;
  triggerMapSelectionOnMount?: boolean;
}

interface MapPoint {
  x: number;
  y: number;
  lat: number;
  lng: number;
  name: string;
}

export const DigitalTwinMap: React.FC<DigitalTwinMapProps> = ({
  isFullScreen = false,
  className = '',
  triggerMapSelectionOnMount = false
}) => {
  const {
    zones,
    vehicles,
    overrides,
    mapLayers,
    toggleMapLayer,
    selectedVehicleId,
    selectVehicle,
    selectedZoneId,
    selectZone,
    deleteZone,
    setActiveTab
  } = useTrafficSystem();

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map Tools
  const [activeTool, setActiveTool] = useState<string>('select');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredVehicle, setHoveredVehicle] = useState<VehicleTelemetry | null>(null);
  const [hoveredZone, setHoveredZone] = useState<SpeedZone | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [editingZone, setEditingZone] = useState<SpeedZone | null>(null);
  const [showLayerPanel, setShowLayerPanel] = useState<boolean>(false);
  const [radarAngle, setRadarAngle] = useState<number>(0);

  // Mouse-Based Zone Creation State
  const [isMapSelecting, setIsMapSelecting] = useState<boolean>(triggerMapSelectionOnMount);
  const [selectionStep, setSelectionStep] = useState<'start' | 'end' | 'confirmed'>('start');
  const [startPoint, setStartPoint] = useState<MapPoint | null>(null);
  const [endPoint, setEndPoint] = useState<MapPoint | null>(null);
  const [hoverCursorPos, setHoverCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [stagedCoordinates, setStagedCoordinates] = useState<{
    start: { x: number; y: number; lat: number; lng: number };
    end: { x: number; y: number; lat: number; lng: number };
  } | null>(null);
  const [stagedInitialValues, setStagedInitialValues] = useState<{
    startLocation?: string;
    endLocation?: string;
    rangeMeters?: number;
    speedLimit?: number;
    type?: ZoneType;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Radar sweep animation
  useEffect(() => {
    const timer = setInterval(() => {
      setRadarAngle(prev => (prev + 2.5) % 360);
    }, 60);
    return () => clearInterval(timer);
  }, []);

  // Preset location quick jumps
  const landmarkLocations = [
    { name: 'KIIT School Safety Zone', x: -120, y: -60, zoom: 1.3 },
    { name: 'AIIMS Hospital Trauma Hub', x: 20, y: -180, zoom: 1.35 },
    { name: 'NH-16 Virtual Humps', x: -280, y: 30, zoom: 1.4 },
    { name: 'Sector 4 Heritage Market', x: -220, y: -140, zoom: 1.3 },
    { name: 'Tech Horizon IT Park', x: -380, y: -100, zoom: 1.3 }
  ];

  const handleSearchSelect = (loc: { x: number; y: number; zoom: number }) => {
    setPan({ x: loc.x, y: loc.y });
    setZoom(loc.zoom);
    setSearchQuery('');
  };

  // Convert client mouse event to SVG coordinate space
  const getSvgCoordinates = (e: React.MouseEvent): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    
    // Reverse the pan and zoom translation group: translate(pan.x, pan.y) translate(500, 350) scale(zoom) translate(-500, -350)
    const shiftedX = (svgP.x - pan.x - 500) / zoom + 500;
    const shiftedY = (svgP.y - pan.y - 350) / zoom + 350;
    return { x: Math.round(shiftedX), y: Math.round(shiftedY) };
  };

  // Snap to nearest known road landmark
  const getNearestRoadLandmark = (x: number, y: number): string => {
    if (y < 160) return `NH-16 Expressway Marker (${x}, ${y})`;
    if (y < 240 && x < 550) return `KIIT University Blvd (${x}, ${y})`;
    if (y > 390 && y < 470 && x < 500) return `AIIMS Hospital Radial Spine (${x}, ${y})`;
    if (y > 300 && y < 350) return `Janpath Commercial Motorway (${x}, ${y})`;
    if (x > 650 && y > 250 && y < 350) return `Tech Horizon Innovation Way (${x}, ${y})`;
    if (y > 340 && y < 420 && x > 480) return `Sector 4 Heritage Market Corridor (${x}, ${y})`;
    if (y > 550) return `Outer Ring Expressway Strip (${x}, ${y})`;
    return `Municipal Road Sector Node (${x}, ${y})`;
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // If in map selection mode, mouse clicks define points rather than pan
    if (isMapSelecting) {
      const coords = getSvgCoordinates(e);
      if (!coords) return;

      const lat = 20.3000 + (coords.y - 350) * 0.0003;
      const lng = 85.8200 + (coords.x - 500) * 0.0003;
      const roadName = getNearestRoadLandmark(coords.x, coords.y);

      if (selectionStep === 'start') {
        setStartPoint({ x: coords.x, y: coords.y, lat, lng, name: roadName });
        setSelectionStep('end');
      } else if (selectionStep === 'end' && startPoint) {
        setEndPoint({ x: coords.x, y: coords.y, lat, lng, name: roadName });
        setSelectionStep('confirmed');
      }
      return;
    }

    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMapSelecting) {
      const coords = getSvgCoordinates(e);
      if (coords) setHoverCursorPos(coords);
    }

    if (!isDragging || isMapSelecting) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(2.5, Math.max(0.6, prev * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Selection actions
  const startMapSelection = () => {
    setIsMapSelecting(true);
    setSelectionStep('start');
    setStartPoint(null);
    setEndPoint(null);
    setActiveTool('select_on_map');
  };

  const handleUndoSelection = () => {
    if (selectionStep === 'confirmed') {
      setEndPoint(null);
      setSelectionStep('end');
    } else if (selectionStep === 'end') {
      setStartPoint(null);
      setSelectionStep('start');
    }
  };

  const handleResetSelection = () => {
    setStartPoint(null);
    setEndPoint(null);
    setSelectionStep('start');
  };

  const handleCancelSelection = () => {
    setIsMapSelecting(false);
    setSelectionStep('start');
    setStartPoint(null);
    setEndPoint(null);
    setActiveTool('select');
  };

  // Calculate estimated distance between two points (in meters)
  const calculateEstimatedDistance = (p1: MapPoint, p2: MapPoint): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const canvasDist = Math.sqrt(dx * dx + dy * dy);
    // Scale factor: 1 canvas unit ≈ 4.5 meters
    const meters = Math.round((canvasDist * 4.5) / 50) * 50;
    return Math.max(150, meters);
  };

  const handleConfirmSelection = () => {
    if (!startPoint || !endPoint) return;
    const distance = calculateEstimatedDistance(startPoint, endPoint);

    setStagedCoordinates({
      start: { x: startPoint.x, y: startPoint.y, lat: startPoint.lat, lng: startPoint.lng },
      end: { x: endPoint.x, y: endPoint.y, lat: endPoint.lat, lng: endPoint.lng }
    });

    setStagedInitialValues({
      startLocation: startPoint.name,
      endLocation: endPoint.name,
      rangeMeters: distance,
      speedLimit: 30,
      type: 'temporary'
    });

    setIsMapSelecting(false);
    setEditingZone(null);
    setIsConfigModalOpen(true);
  };

  const handleToolClick = (tool: string) => {
    if (tool === 'select_on_map') {
      startMapSelection();
      return;
    }
    if (tool === 'create') {
      setEditingZone(null);
      setStagedCoordinates(null);
      setStagedInitialValues(null);
      setIsConfigModalOpen(true);
      return;
    }
    setActiveTool(tool);
  };

  const handleZoneClick = (zone: SpeedZone) => {
    if (isMapSelecting) return;
    if (activeTool === 'delete') {
      deleteZone(zone.id);
      return;
    }
    if (activeTool === 'edit') {
      setEditingZone(zone);
      setIsConfigModalOpen(true);
      return;
    }
    selectZone(zone.id);
  };

  const activeSelectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const selectedDistance = startPoint && endPoint ? calculateEstimatedDistance(startPoint, endPoint) : 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-[#eef2f6] border border-slate-200 rounded-xl select-none shadow-xs ${
        isFullScreen ? 'h-[calc(100vh-8.5rem)]' : 'h-[580px]'
      } ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isMapSelecting ? 'crosshair' : isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Top Floating Search & Location Selector */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 border border-slate-200 shadow-md backdrop-blur-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search road or speed corridor..."
              className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-56 font-sans"
            />
          </div>

          {searchQuery && (
            <div className="absolute left-0 mt-1.5 w-72 rounded-lg bg-white border border-slate-200 shadow-xl p-1 z-30 text-xs">
              {landmarkLocations
                .filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchSelect(loc)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 text-slate-800 flex items-center justify-between transition-colors"
                  >
                    <span>{loc.name}</span>
                    <span className="text-[10px] font-mono text-teal-700 font-semibold">JUMP →</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Quick Location Pills */}
        <div className="hidden xl:flex items-center gap-1.5 bg-white/90 p-1 rounded-lg border border-slate-200 shadow-xs backdrop-blur-xs">
          {landmarkLocations.slice(0, 3).map((loc, idx) => (
            <button
              key={idx}
              onClick={() => handleSearchSelect(loc)}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              {loc.name.split(' ')[0]} {loc.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Map Toolbar (Center-Top / Right-Top) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-1 p-1 bg-white/95 border border-slate-200 rounded-xl shadow-md backdrop-blur-xs">
          {/* Create Zone */}
          <button
            onClick={() => handleToolClick('create')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTool === 'create'
                ? 'bg-teal-700 text-white font-bold shadow-xs'
                : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
            }`}
            title="Create Virtual Speed Zone (Form)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Zone</span>
          </button>

          {/* Mouse Point Selection Tool */}
          <button
            onClick={() => handleToolClick('select_on_map')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isMapSelecting
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Interactive Map Point Selection"
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Select on Map</span>
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Pointer / Select */}
          <button
            onClick={() => {
              setIsMapSelecting(false);
              handleToolClick('select');
            }}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              activeTool === 'select' && !isMapSelecting
                ? 'bg-slate-100 text-teal-800 border border-slate-300'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Select & Inspect"
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>

          {/* Edit */}
          <button
            onClick={() => handleToolClick('edit')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              activeTool === 'edit'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Edit Zone Parameters"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={() => handleToolClick('delete')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              activeTool === 'delete'
                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Delete Zone"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Layer toggles popover trigger */}
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              showLayerPanel
                ? 'bg-slate-100 text-teal-800 border border-slate-300'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="GIS Overlay Layers"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MAP POINT SELECTION INTERACTIVE INSTRUCTION BANNER */}
      {isMapSelecting && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-teal-600 shadow-xl text-xs text-slate-800 animate-in fade-in slide-in-from-top-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping shrink-0" />
          <div className="font-medium">
            {selectionStep === 'start' && (
              <span>
                <strong className="text-teal-900 font-bold">[Step 1 of 2]</strong> Click the{' '}
                <span className="text-teal-700 font-bold underline">STARTING POINT</span> of the controlled road section on the map.
              </span>
            )}
            {selectionStep === 'end' && (
              <span>
                <strong className="text-amber-800 font-bold">[Step 2 of 2]</strong> Now click the{' '}
                <span className="text-amber-700 font-bold underline">ENDING POINT</span> of the road section.
              </span>
            )}
            {selectionStep === 'confirmed' && (
              <span>
                <strong className="text-emerald-800 font-bold">Road Section Defined:</strong> {selectedDistance} m controlled corridor ready.
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
            {selectionStep !== 'start' && (
              <button
                onClick={handleUndoSelection}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1"
                title="Undo last point"
              >
                <Undo2 className="w-3 h-3" />
                <span>Undo</span>
              </button>
            )}

            <button
              onClick={handleResetSelection}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1"
              title="Reset selection points"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleCancelSelection}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FLOATING ZONE PREVIEW CARD (When two points are selected) */}
      {isMapSelecting && startPoint && endPoint && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-md p-4 rounded-xl bg-white/95 border border-teal-500 shadow-2xl backdrop-blur-xs text-xs text-slate-800 animate-in fade-in slide-in-from-bottom-2 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase text-[11px] font-mono">
              <Compass className="w-4 h-4 text-teal-700" />
              <span>Speed Zone Section Preview</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              ROAD CORRIDOR READY
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-400 text-[10px] block font-mono uppercase">Start Location:</span>
                <span className="font-semibold text-slate-800 truncate block">{startPoint.name}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 mt-1 shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-400 text-[10px] block font-mono uppercase">End Location:</span>
                <span className="font-semibold text-slate-800 truncate block">{endPoint.name}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Estimated Distance:</span>
                <span className="font-bold text-teal-800 font-mono text-sm">
                  {(selectedDistance / 1000).toFixed(2)} km ({selectedDistance} m)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Default Limit:</span>
                <span className="font-bold text-amber-700 font-mono text-sm">30 km/h · Controlled</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleResetSelection}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs"
            >
              Reset Points
            </button>
            <button
              onClick={handleConfirmSelection}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs"
            >
              <span>Confirm & Configure Zone</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Layer Options Drawer/Popover */}
      {showLayerPanel && (
        <div className="absolute top-16 right-4 z-30 w-60 rounded-xl bg-white border border-slate-200 shadow-xl p-3 text-xs">
          <div className="font-semibold text-slate-900 pb-2 mb-2 border-b border-slate-100 flex justify-between items-center">
            <span>GIS Map Layers</span>
            <span className="text-[10px] font-mono text-teal-700">VECTOR v2.6</span>
          </div>
          <div className="space-y-2">
            {[
              { key: 'showRoads' as const, label: 'Road Networks & Curbs' },
              { key: 'showZones' as const, label: 'Virtual Speed Corridors' },
              { key: 'showVirtualHumps' as const, label: 'Virtual Humps Deceleration Strips' },
              { key: 'showVehicles' as const, label: 'Connected Vehicle Telemetry' },
              { key: 'showSpeedLabels' as const, label: 'Speed Limit Signboards' },
              { key: 'showTrafficDensity' as const, label: 'Traffic Density Mesh' },
              { key: 'showRadarScan' as const, label: 'V2X Radar Sweep Beam' }
            ].map(layer => (
              <label
                key={layer.key}
                className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer py-1"
              >
                <span>{layer.label}</span>
                <input
                  type="checkbox"
                  checked={mapLayers[layer.key]}
                  onChange={() => toggleMapLayer(layer.key)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-0 bg-white"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Zoom / Pan Controls (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-white/95 border border-slate-200 p-1 rounded-xl shadow-md backdrop-blur-xs">
        <button
          onClick={() => setZoom(prev => Math.min(2.5, prev * 1.2))}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.6, prev / 1.2))}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-slate-200" />
        <button
          onClick={resetView}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900"
          title="Reset Map View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Map Canvas (SVG Vector Engine) */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle light grid pattern */}
          <pattern id="lightGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
          </pattern>
          
          {/* Color-blind safe hatching for Temporary School/Event Zone */}
          <pattern id="lightDiagonalHatchSchool" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#d97706" strokeWidth="2.5" opacity="0.35" />
          </pattern>

          {/* Color-blind safe crosshatch for Permanent Hospital Corridor */}
          <pattern id="lightDiagonalHatchHospital" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#0f766e" strokeWidth="2.5" opacity="0.35" />
          </pattern>

          {/* Color-blind safe vertical lines for Virtual Humps */}
          <pattern id="lightDiagonalHatchVirtualHump" width="8" height="8" patternTransform="rotate(90 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#059669" strokeWidth="3" opacity="0.4" />
          </pattern>

          {/* Selection preview pattern */}
          <pattern id="selectionCorridorHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#0d9488" strokeWidth="2" opacity="0.5" />
          </pattern>
        </defs>

        {/* Pan and Zoom Transformation Group */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) translate(500, 350) scale(${zoom}) translate(-500, -350)`}
        >
          {/* Background Canvas */}
          <rect x="-500" y="-300" width="2000" height="1300" fill="#f1f5f9" />
          <rect x="-500" y="-300" width="2000" height="1300" fill="url(#lightGrid)" />

          {/* Natural River / Kuakhai river boundary aesthetic */}
          <path
            d="M 900 -100 Q 820 200, 890 500 T 950 800"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="80"
            strokeLinecap="round"
          />

          {/* ROAD NETWORKS (Layer 1 - Crisp, visible road hierarchy) */}
          {mapLayers.showRoads && (
            <g id="road-networks">
              {/* NH-16 National Highway Expressway (Top West to East) */}
              <path
                d="M 50 140 L 950 140"
                stroke="#cbd5e1"
                strokeWidth="28"
                strokeLinecap="round"
              />
              <path
                d="M 50 140 L 950 140"
                stroke="#334155"
                strokeWidth="22"
              />
              <path
                d="M 50 140 L 950 140"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeDasharray="12 12"
              />

              {/* KIIT University Boulevard (Upper Diagonal Corridor) */}
              <path
                d="M 120 180 L 520 215"
                stroke="#cbd5e1"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <path
                d="M 120 180 L 520 215"
                stroke="#475569"
                strokeWidth="18"
              />
              <path
                d="M 120 180 L 520 215"
                stroke="#ffffff"
                strokeWidth="1"
                strokeDasharray="8 8"
              />

              {/* Nandankanan Arterial Expressway (North-South Spine) */}
              <path
                d="M 510 80 L 510 650"
                stroke="#cbd5e1"
                strokeWidth="26"
                strokeLinecap="round"
              />
              <path
                d="M 510 80 L 510 650"
                stroke="#334155"
                strokeWidth="20"
              />
              <path
                d="M 510 80 L 510 650"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeDasharray="10 10"
              />

              {/* Health City / AIIMS Hospital Corridor (Lower Left) */}
              <path
                d="M 100 410 L 460 450"
                stroke="#cbd5e1"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <path
                d="M 100 410 L 460 450"
                stroke="#475569"
                strokeWidth="18"
              />
              <path
                d="M 100 410 L 460 450"
                stroke="#ffffff"
                strokeWidth="1"
                strokeDasharray="8 8"
              />

              {/* Janpath Diplomatic Enclave (Middle Horizontal Spine) */}
              <path
                d="M 320 320 L 720 335"
                stroke="#cbd5e1"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <path
                d="M 320 320 L 720 335"
                stroke="#475569"
                strokeWidth="18"
              />
              <path
                d="M 320 320 L 720 335"
                stroke="#ffffff"
                strokeWidth="1"
                strokeDasharray="8 8"
              />

              {/* Sector 4 Heritage Market Alley (Middle-Right Curve) */}
              <path
                d="M 480 350 Q 600 375, 750 395"
                stroke="#cbd5e1"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M 480 350 Q 600 375, 750 395"
                stroke="#64748b"
                strokeWidth="14"
              />

              {/* Old Town Blind Curve (Lower Cultural Spine) */}
              <path
                d="M 260 470 Q 360 525, 480 520"
                stroke="#cbd5e1"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <path
                d="M 260 470 Q 360 525, 480 520"
                stroke="#64748b"
                strokeWidth="12"
              />

              {/* Tech Horizon IT Park Boulevard (Far Right Corridor) */}
              <path
                d="M 680 270 L 920 320"
                stroke="#cbd5e1"
                strokeWidth="22"
                strokeLinecap="round"
              />
              <path
                d="M 680 270 L 920 320"
                stroke="#475569"
                strokeWidth="16"
              />

              {/* Outer Ring Expansion Strip (Bottom Horizontal) */}
              <path
                d="M 180 590 L 780 615"
                stroke="#cbd5e1"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <path
                d="M 180 590 L 780 615"
                stroke="#475569"
                strokeWidth="18"
              />

              {/* Major Junction Roundabout: KIIT Square */}
              <circle cx="510" cy="214" r="24" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="510" cy="214" r="12" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />

              {/* Major Junction Roundabout: Janpath Radial */}
              <circle cx="510" cy="328" r="26" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="510" cy="328" r="14" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
            </g>
          )}

          {/* V2X RADAR SWEEP (Subtle, professional) */}
          {mapLayers.showRadarScan && (
            <g id="radar-sweep" opacity="0.12">
              <circle cx="510" cy="328" r="280" fill="none" stroke="#0f766e" strokeWidth="1" strokeDasharray="4 6" />
              <circle cx="510" cy="328" r="180" fill="none" stroke="#0f766e" strokeWidth="0.8" />
              <circle cx="510" cy="328" r="80" fill="none" stroke="#0f766e" strokeWidth="0.8" />
              <line
                x1="510"
                y1="328"
                x2={510 + 280 * Math.cos((radarAngle * Math.PI) / 180)}
                y2={328 + 280 * Math.sin((radarAngle * Math.PI) / 180)}
                stroke="#0f766e"
                strokeWidth="2"
              />
            </g>
          )}

          {/* CONTROLLED SPEED ZONES (Layer 2) */}
          {mapLayers.showZones && (
            <g id="speed-zones">
              {zones.map(zone => {
                const isSelected = selectedZoneId === zone.id;
                const isHovered = hoveredZone?.id === zone.id;

                const sx = zone.coordinates.start.x;
                const sy = zone.coordinates.start.y;
                const ex = zone.coordinates.end.x;
                const ey = zone.coordinates.end.y;
                const mx = (sx + ex) / 2;
                const my = (sy + ey) / 2;

                const isVirtualHump = zone.type === 'virtual_hump';
                const isHospital = zone.type === 'permanent';
                const isSchool = zone.type === 'temporary';

                const strokeColor = isVirtualHump
                  ? '#059669'
                  : isHospital
                  ? '#0f766e'
                  : '#d97706';

                return (
                  <g
                    key={zone.id}
                    onClick={() => handleZoneClick(zone)}
                    onMouseEnter={() => setHoveredZone(zone)}
                    onMouseLeave={() => setHoveredZone(null)}
                    className="cursor-pointer transition-all"
                  >
                    {/* Zone bounding envelope with soft translucent fill */}
                    <line
                      x1={sx}
                      y1={sy}
                      x2={ex}
                      y2={ey}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? "34" : "28"}
                      strokeOpacity={isSelected ? "0.35" : "0.20"}
                      strokeLinecap="round"
                    />

                    {/* Centerline outline */}
                    <line
                      x1={sx}
                      y1={sy}
                      x2={ex}
                      y2={ey}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? "3" : "2"}
                      strokeDasharray={zone.isDraft ? "6 4" : "none"}
                    />

                    {/* Start / End Boundary Gates */}
                    <circle cx={sx} cy={sy} r="4" fill={strokeColor} stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx={ex} cy={ey} r="4" fill={strokeColor} stroke="#ffffff" strokeWidth="1.5" />

                    {/* Virtual Hump Specific Markers */}
                    {isVirtualHump && mapLayers.showVirtualHumps && (
                      <g>
                        {[-15, 0, 15].map((offset, i) => (
                          <line
                            key={i}
                            x1={mx + offset - 8}
                            y1={my - 8}
                            x2={mx + offset + 8}
                            y2={my + 8}
                            stroke="#059669"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        ))}
                      </g>
                    )}

                    {/* Speed Limit Marker Signboard Badge */}
                    {mapLayers.showSpeedLabels && (
                      <g transform={`translate(${mx}, ${my - 18})`}>
                        {/* Speed Sign Roundel */}
                        <circle cx="0" cy="0" r="13" fill="#ffffff" stroke="#ef4444" strokeWidth="2.5" />
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fill="#0f172a"
                          fontSize="10"
                          fontWeight="800"
                          fontFamily="monospace"
                        >
                          {zone.speedLimit}
                        </text>

                        {/* Zone Name Label on hover / selection */}
                        {(isSelected || isHovered) && (
                          <g transform="translate(0, -18)">
                            <rect
                              x="-75"
                              y="-16"
                              width="150"
                              height="22"
                              rx="4"
                              fill="#ffffff"
                              stroke={strokeColor}
                              strokeWidth="1.5"
                              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                            />
                            <text
                              x="0"
                              y="-2"
                              textAnchor="middle"
                              fill="#0f172a"
                              fontSize="9"
                              fontWeight="700"
                              fontFamily="sans-serif"
                            >
                              {zone.name.length > 22 ? zone.name.substring(0, 22) + '…' : zone.name}
                            </text>
                          </g>
                        )}
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* INTERACTIVE MOUSE-BASED ZONE SELECTION PREVIEW (Layer) */}
          {isMapSelecting && (
            <g id="selection-layer">
              {/* Start Point Marker */}
              {startPoint && (
                <g transform={`translate(${startPoint.x}, ${startPoint.y})`}>
                  <circle cx="0" cy="0" r="18" fill="#10b981" fillOpacity="0.25" className="animate-ping" />
                  <circle cx="0" cy="0" r="8" fill="#059669" stroke="#ffffff" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="3" fill="#ffffff" />
                  <g transform="translate(0, -16)">
                    <rect x="-24" y="-14" width="48" height="16" rx="4" fill="#065f46" />
                    <text x="0" y="-3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">START</text>
                  </g>
                </g>
              )}

              {/* Rubberband / Corridor connecting start to end or cursor */}
              {startPoint && (endPoint || hoverCursorPos) && (
                <g>
                  {/* Projected road corridor */}
                  <line
                    x1={startPoint.x}
                    y1={startPoint.y}
                    x2={endPoint ? endPoint.x : hoverCursorPos!.x}
                    y2={endPoint ? endPoint.y : hoverCursorPos!.y}
                    stroke="#0d9488"
                    strokeWidth="28"
                    strokeOpacity="0.28"
                    strokeLinecap="round"
                  />
                  <line
                    x1={startPoint.x}
                    y1={startPoint.y}
                    x2={endPoint ? endPoint.x : hoverCursorPos!.x}
                    y2={endPoint ? endPoint.y : hoverCursorPos!.y}
                    stroke="#0f766e"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                </g>
              )}

              {/* End Point Marker */}
              {endPoint && (
                <g transform={`translate(${endPoint.x}, ${endPoint.y})`}>
                  <circle cx="0" cy="0" r="18" fill="#d97706" fillOpacity="0.25" className="animate-ping" />
                  <circle cx="0" cy="0" r="8" fill="#d97706" stroke="#ffffff" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="3" fill="#ffffff" />
                  <g transform="translate(0, -16)">
                    <rect x="-20" y="-14" width="40" height="16" rx="4" fill="#92400e" />
                    <text x="0" y="-3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">END</text>
                  </g>
                </g>
              )}
            </g>
          )}

          {/* CONNECTED VEHICLES (Layer 3 - Crisp glyphs & labels) */}
          {mapLayers.showVehicles && (
            <g id="connected-vehicles">
              {vehicles.map(vehicle => {
                const isSelected = selectedVehicleId === vehicle.id;
                const isHovered = hoveredVehicle?.id === vehicle.id;
                const isEmergency = vehicle.type === 'emergency';
                const hasOverride = vehicle.hasActiveOverride;
                const isOverspeeding = vehicle.currentSpeed > vehicle.allowedSpeed;

                const vx = vehicle.coordinates.x;
                const vy = vehicle.coordinates.y;

                const vehicleColor = hasOverride
                  ? '#d97706'
                  : isEmergency
                  ? '#0284c7'
                  : isOverspeeding
                  ? '#e11d48'
                  : '#059669';

                return (
                  <g
                    key={vehicle.id}
                    transform={`translate(${vx}, ${vy})`}
                    onClick={() => {
                      if (!isMapSelecting) selectVehicle(vehicle.id);
                    }}
                    onMouseEnter={() => setHoveredVehicle(vehicle)}
                    onMouseLeave={() => setHoveredVehicle(null)}
                    className="cursor-pointer"
                  >
                    {/* Active override pulsing alert ring */}
                    {hasOverride && (
                      <circle
                        cx="0"
                        cy="0"
                        r="18"
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        className="animate-spin"
                      />
                    )}

                    {/* Heading direction trail vector */}
                    <line
                      x1="0"
                      y1="0"
                      x2={14 * Math.cos((vehicle.heading * Math.PI) / 180)}
                      y2={14 * Math.sin((vehicle.heading * Math.PI) / 180)}
                      stroke={vehicleColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    {/* Vehicle body marker */}
                    {vehicle.type === 'bus' || vehicle.type === 'truck' ? (
                      <rect
                        x="-7"
                        y="-7"
                        width="14"
                        height="14"
                        rx="2"
                        fill={vehicleColor}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    ) : (
                      <circle
                        cx="0"
                        cy="0"
                        r="7"
                        fill={vehicleColor}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    )}

                    {/* Inner core glyph */}
                    <circle cx="0" cy="0" r="2.5" fill="#ffffff" />

                    {/* Vehicle ID and Speed Tag */}
                    <g transform="translate(10, -8)">
                      <rect
                        x="0"
                        y="-8"
                        width={hasOverride ? "68" : "56"}
                        height="14"
                        rx="3"
                        fill="#ffffff"
                        stroke={hasOverride ? "#d97706" : "#cbd5e1"}
                        strokeWidth="1"
                      />
                      <text
                        x="4"
                        y="2"
                        fill="#0f172a"
                        fontSize="7.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        {vehicle.id}
                      </text>
                      <text
                        x={hasOverride ? "38" : "32"}
                        y="2"
                        fill={isOverspeeding ? "#e11d48" : "#059669"}
                        fontSize="7"
                        fontWeight="800"
                        fontFamily="monospace"
                      >
                        {vehicle.currentSpeed}k
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}
        </g>
      </svg>

      {/* Floating Bottom Live Telemetry Stat Panels around the map */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-2.5">
        {/* Panel 1: School Zone Status */}
        <div className="px-3 py-2 rounded-xl bg-white/95 border border-slate-200 shadow-md text-xs backdrop-blur-xs">
          <div className="flex items-center gap-1.5 text-amber-700 font-bold text-[10px] uppercase font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            School Safety Zone
          </div>
          <div className="text-slate-900 font-semibold text-xs mt-0.5">30 km/h · 900 m range</div>
          <div className="text-[10px] text-slate-500 font-mono">KIIT University Crossing</div>
        </div>

        {/* Panel 2: Hospital Emergency Zone Status */}
        <div className="px-3 py-2 rounded-xl bg-white/95 border border-slate-200 shadow-md text-xs backdrop-blur-xs">
          <div className="flex items-center gap-1.5 text-teal-800 font-bold text-[10px] uppercase font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            Hospital Trauma Corridor
          </div>
          <div className="text-slate-900 font-semibold text-xs mt-0.5">30 km/h · Permanent</div>
          <div className="text-[10px] text-slate-500 font-mono">AIIMS Priority Transit</div>
        </div>

        {/* Panel 3: Virtual Humps Status */}
        <div className="px-3 py-2 rounded-xl bg-white/95 border border-slate-200 shadow-md text-xs backdrop-blur-xs">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[10px] uppercase font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Virtual Hump Series
          </div>
          <div className="text-slate-900 font-semibold text-xs mt-0.5">20 km/h · Deceleration</div>
          <div className="text-[10px] text-slate-500 font-mono">NH-16 Toll Approach Alpha</div>
        </div>
      </div>

      {/* Hover Inspection Popover Card */}
      {(hoveredVehicle || activeSelectedVehicle) && !isMapSelecting && (
        <div className="absolute top-16 left-4 z-30 w-72 rounded-xl bg-white border border-slate-200 p-3.5 shadow-xl backdrop-blur-xs text-xs animate-in fade-in duration-100">
          {(() => {
            const v = activeSelectedVehicle || hoveredVehicle!;
            return (
              <div className="space-y-2">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div>
                    <div className="font-mono text-base font-bold text-slate-900 flex items-center gap-2">
                      <Car className="w-4 h-4 text-teal-700" />
                      {v.id}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{v.plateNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-black tabular-nums text-teal-800">
                      {v.currentSpeed} <span className="text-[10px] font-sans font-medium text-slate-500">km/h</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Allowed: {v.allowedSpeed} km/h</div>
                  </div>
                </div>

                <div className="space-y-1 text-slate-700 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehicle Type:</span>
                    <span className="font-semibold text-slate-900 capitalize">{v.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Zone:</span>
                    <span className="text-teal-800 font-medium truncate max-w-[150px]">
                      {v.currentZoneName || 'Unrestricted Roadway'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Road Corridor:</span>
                    <span className="text-slate-800 truncate max-w-[150px]">{v.roadName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Override:</span>
                    {v.hasActiveOverride ? (
                      <span className="text-amber-700 font-bold font-mono">ACTIVE (OVR)</span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      selectVehicle(v.id);
                      setActiveTab('vehicles');
                    }}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100"
                  >
                    Open Live Telemetry Feed →
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Zone Configuration Modal */}
      <ZoneConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setEditingZone(null);
          setStagedCoordinates(null);
          setStagedInitialValues(null);
        }}
        editZone={editingZone}
        initialCoordinates={stagedCoordinates}
        initialValues={stagedInitialValues}
        onActivateMapSelection={() => startMapSelection()}
      />
    </div>
  );
};
