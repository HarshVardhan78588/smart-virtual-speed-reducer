import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Layers,
  Clock,
  Calendar,
  AlertTriangle,
  Shield,
  Gauge,
  MapPin,
  CheckCircle2,
  FileCheck,
  MousePointerClick
} from 'lucide-react';
import { SpeedZone, ZoneType, ZonePriority, ZoneStatus } from '../../types';
import { useTrafficSystem } from '../../context/TrafficSystemContext';

interface ZoneConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  editZone?: SpeedZone | null;
  initialCoordinates?: {
    start: { x: number; y: number; lat: number; lng: number };
    end: { x: number; y: number; lat: number; lng: number };
  } | null;
  initialValues?: {
    startLocation?: string;
    endLocation?: string;
    rangeMeters?: number;
    speedLimit?: number;
    type?: ZoneType;
  } | null;
  onActivateMapSelection?: () => void;
}

export const ZoneConfigModal: React.FC<ZoneConfigModalProps> = ({
  isOpen,
  onClose,
  editZone,
  initialCoordinates,
  initialValues,
  onActivateMapSelection
}) => {
  const { createZone, updateZone } = useTrafficSystem();

  const [inputMode, setInputMode] = useState<'landmark' | 'map'>('landmark');
  const [name, setName] = useState<string>('New Municipal Virtual Speed Zone');
  const [type, setType] = useState<ZoneType>('temporary');
  const [speedLimit, setSpeedLimit] = useState<number>(30);
  const [rangeMeters, setRangeMeters] = useState<number>(800);
  const [startLocation, setStartLocation] = useState<string>('Junction North Marker');
  const [endLocation, setEndLocation] = useState<string>('Junction South Marker');
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [days, setDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [reason, setReason] = useState<string>(
    'Pedestrian density protection & digital deceleration enforcement'
  );
  const [priority, setPriority] = useState<ZonePriority>('high');
  const [status, setStatus] = useState<ZoneStatus>('draft');
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  // Sync state whenever editZone or initialValues change
  useEffect(() => {
    if (editZone) {
      setName(editZone.name);
      setType(editZone.type);
      setSpeedLimit(editZone.speedLimit);
      setRangeMeters(editZone.rangeMeters);
      setStartLocation(editZone.startLocation);
      setEndLocation(editZone.endLocation);
      setStartTime(editZone.schedule.startTime);
      setEndTime(editZone.schedule.endTime);
      setStartDate(editZone.schedule.startDate);
      setEndDate(editZone.schedule.endDate);
      setDays(editZone.schedule.days);
      setReason(editZone.reason);
      setPriority(editZone.priority);
      setStatus(editZone.status);
    } else {
      if (initialValues) {
        if (initialValues.startLocation) setStartLocation(initialValues.startLocation);
        if (initialValues.endLocation) setEndLocation(initialValues.endLocation);
        if (initialValues.rangeMeters) setRangeMeters(initialValues.rangeMeters);
        if (initialValues.speedLimit) setSpeedLimit(initialValues.speedLimit);
        if (initialValues.type) setType(initialValues.type);
        setInputMode('map');
      }
    }
  }, [editZone, initialValues, isOpen]);

  if (!isOpen) return null;

  const handleDayToggle = (day: string) => {
    if (days.includes(day)) {
      setDays(days.filter(d => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const coords = editZone?.coordinates || initialCoordinates || {
      start: { x: 300, y: 250, lat: 20.3200, lng: 85.8150 },
      end: { x: 450, y: 270, lat: 20.3240, lng: 85.8220 }
    };

    if (editZone) {
      updateZone(editZone.id, {
        name,
        type,
        speedLimit: Number(speedLimit),
        rangeMeters: Number(rangeMeters),
        startLocation,
        endLocation,
        schedule: {
          startTime,
          endTime,
          startDate,
          endDate,
          days: days.length > 0 ? days : ['Everyday']
        },
        reason,
        priority,
        status
      });
    } else {
      createZone({
        name,
        type,
        speedLimit: Number(speedLimit),
        rangeMeters: Number(rangeMeters),
        startLocation,
        endLocation,
        coordinates: coords,
        schedule: {
          startTime,
          endTime,
          startDate,
          endDate,
          days: days.length > 0 ? days : ['Everyday']
        },
        reason,
        priority,
        status: 'draft',
        isDraft: true
      });
    }

    onClose();
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="zone-config-title"
    >
      <div className="w-full max-w-2xl my-8 rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 id="zone-config-title" className="text-sm font-bold text-slate-900 tracking-tight">
                {editZone ? 'Edit Virtual Speed Zone Parameters' : 'Configure New Virtual Speed Zone'}
              </h2>
              <div className="text-[11px] font-mono text-slate-500">
                Digital Speed Reducer Geometry & Dynamic Restriction Profile
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Edit vs Preview */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 px-6 pt-2">
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              !previewMode
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            1. Zone Specifications
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              previewMode
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            2. Authority Preview Card
          </button>
        </div>

        {previewMode ? (
          /* PREVIEW MODE */
          <div className="p-6 space-y-5">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold">
                    PREVIEW · V2X BROKER PAYLOAD
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{name}</h3>
                  <div className="text-xs text-slate-600 mt-0.5">{startLocation} → {endLocation}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-amber-600 tabular-nums">
                    {speedLimit} <span className="text-xs font-sans font-medium text-slate-500">km/h</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">MANDATORY LIMIT</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-white border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Zone Type:</span>
                  <span className="font-semibold text-slate-900 capitalize">{type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Enforcement Range:</span>
                  <span className="font-mono text-teal-800 font-bold">{rangeMeters} meters</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Schedule Window:</span>
                  <span className="font-mono text-slate-800">{startTime} - {endTime}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Priority:</span>
                  <span className="font-bold text-amber-800 uppercase">{priority}</span>
                </div>
              </div>

              <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-900">Regulatory Justification: </span>
                {reason}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Zone will be saved as DRAFT. Must be confirmed with Authority PIN before vehicle broadcast.</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
              >
                ← Return to Editor
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs"
              >
                Save & Stage for Authority Verification
              </button>
            </div>
          </div>
        ) : (
          /* FORM EDITOR */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
            {/* Location Selection Method Switcher */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Location Selection Method:</span>
                {initialCoordinates && (
                  <span className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Points Selected on Map
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode('landmark')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                    inputMode === 'landmark'
                      ? 'bg-white text-slate-900 border-slate-300 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Enter Landmark Manually</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInputMode('map');
                    if (onActivateMapSelection) {
                      onClose();
                      onActivateMapSelection();
                    }
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                    inputMode === 'map'
                      ? 'bg-teal-50 text-teal-900 border-teal-300 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-white'
                  }`}
                >
                  <MousePointerClick className="w-3.5 h-3.5 text-teal-600" />
                  <span>Select on Map (Click 2 Points)</span>
                </button>
              </div>
            </div>

            {/* Zone Name */}
            <div>
              <label htmlFor="zone-name" className="block text-xs font-semibold text-slate-800 mb-1">
                Zone Name <span className="text-rose-600">*</span>
              </label>
              <input
                id="zone-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                placeholder="e.g. KIIT Main Gate School Safety Zone"
              />
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="zone-type" className="block text-xs font-semibold text-slate-800 mb-1">
                  Zone Type
                </label>
                <select
                  id="zone-type"
                  value={type}
                  onChange={e => setType(e.target.value as ZoneType)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                >
                  <option value="temporary">Temporary Speed Zone (School / Event)</option>
                  <option value="permanent">Permanent Zone (Hospital / Urban Core)</option>
                  <option value="virtual_hump">Virtual Hump Series (Rumble Strip Replacement)</option>
                  <option value="dynamic_restriction">Dynamic Restriction (Construction / Weather)</option>
                </select>
              </div>

              <div>
                <label htmlFor="zone-priority" className="block text-xs font-semibold text-slate-800 mb-1">
                  Enforcement Priority
                </label>
                <select
                  id="zone-priority"
                  value={priority}
                  onChange={e => setPriority(e.target.value as ZonePriority)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                >
                  <option value="critical">Critical (Zero-tolerance brake assist)</option>
                  <option value="high">High (Audible chime + active virtual governor)</option>
                  <option value="medium">Medium (Visual HUD warning + soft governor)</option>
                  <option value="low">Low (Advisory speed suggestion)</option>
                </select>
              </div>
            </div>

            {/* Speed Limit & Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="speed-limit" className="block text-xs font-semibold text-slate-800 mb-1">
                  Speed Limit (km/h) <span className="text-rose-600">*</span>
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    id="speed-limit"
                    type="number"
                    min={10}
                    max={120}
                    step={5}
                    value={speedLimit}
                    onChange={e => setSpeedLimit(Number(e.target.value))}
                    className="w-20 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-amber-700 focus:outline-none focus:border-teal-600"
                  />
                  <div className="flex gap-1">
                    {[20, 25, 30, 40, 50].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSpeedLimit(s)}
                        className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                          speedLimit === s
                            ? 'bg-teal-700 border-teal-700 text-white font-bold'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="range-meters" className="block text-xs font-semibold text-slate-800 mb-1">
                  Controlled Distance (Meters)
                </label>
                <input
                  id="range-meters"
                  type="number"
                  min={100}
                  max={5000}
                  step={50}
                  value={rangeMeters}
                  onChange={e => setRangeMeters(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-teal-800 font-semibold focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            {/* Start and End Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-location" className="block text-xs font-semibold text-slate-800 mb-1">
                  Start Location Marker
                </label>
                <input
                  id="start-location"
                  type="text"
                  value={startLocation}
                  onChange={e => setStartLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600"
                  placeholder="e.g. KIIT Square North Crossing"
                />
              </div>

              <div>
                <label htmlFor="end-location" className="block text-xs font-semibold text-slate-800 mb-1">
                  End Location Marker
                </label>
                <input
                  id="end-location"
                  type="text"
                  value={endLocation}
                  onChange={e => setEndLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600"
                  placeholder="e.g. Campus 6 Academic Block Gate"
                />
              </div>
            </div>

            {/* Daily Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-time" className="block text-xs font-semibold text-slate-800 mb-1">
                  Active Start Time (IST)
                </label>
                <input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label htmlFor="end-time" className="block text-xs font-semibold text-slate-800 mb-1">
                  Active End Time (IST)
                </label>
                <input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            {/* Operating Days */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Active Days of Week
              </label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map(d => {
                  const isChecked = days.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleDayToggle(d)}
                      className={`px-3 py-1 text-xs font-mono rounded-lg border transition-colors ${
                        isChecked
                          ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Regulatory Reason */}
            <div>
              <label htmlFor="zone-reason" className="block text-xs font-semibold text-slate-800 mb-1">
                Enforcement Reason & Pedestrian Safety Context
              </label>
              <textarea
                id="zone-reason"
                rows={2}
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600"
                placeholder="e.g. High student pedestrian crossing density during school hours"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                <span>Preview Zone Card</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
                >
                  {editZone ? 'Update Zone (Staged)' : 'Stage as Draft Zone'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
