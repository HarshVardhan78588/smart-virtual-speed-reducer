import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OverrideReason } from '../types';
import {
  AlertOctagon,
  ShieldAlert,
  Clock,
  Radio,
  FileCheck,
  AlertTriangle,
  Upload,
  CheckCircle2,
  XCircle,
  FileText,
  RotateCcw,
  Info,
  ChevronRight,
  Eye,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const EmergencySection: React.FC = () => {
  const {
    overrideState,
    activateOverride,
    endOverride,
    flagOverrideActivity,
    simulateBlockedState,
    resetOverrideState,
    verificationRequest,
    submitVerification,
    updateVerificationStatus,
    currentSpeed,
  } = useApp();

  // Wizard modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<OverrideReason>('Medical Emergency');
  const [otherText, setOtherText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Verification submission state
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [explanationInput, setExplanationInput] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<string>('Hospital_Emergency_Triage_Proof.pdf');
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleStartRequest = () => {
    setIsConfirmModalOpen(true);
    setErrorMessage('');
  };

  const handleConfirmActivation = async () => {
    if (selectedReason === 'Other' && !otherText.trim()) {
      setErrorMessage('Please provide an explanation for the emergency.');
      return;
    }
    await activateOverride(selectedReason, otherText);
    setIsConfirmModalOpen(false);
    setOtherText('');
  };

  const handleSubmitVerificationForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanationInput.trim()) {
      alert('Please enter an explanation of the emergency event.');
      return;
    }
    setSubmittingVerification(true);
    await new Promise((res) => setTimeout(res, 500));
    await submitVerification(explanationInput, attachmentFile);
    setSubmittingVerification(false);
    setIsVerificationModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-16 md:pb-6">
      {/* Simulation Scenario Switcher for Judges / Reviewers */}
      <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Radio className="w-3.5 h-3.5 text-teal-800" />
          <span>Workflow Quick Switcher (Prototype Testing):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => resetOverrideState()}
            className={`px-2.5 py-1 rounded border font-medium transition-colors ${
              overrideState.status === 'idle'
                ? 'bg-teal-800 text-white border-teal-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            1. Normal Idle State
          </button>
          <button
            onClick={() => activateOverride('Medical Emergency')}
            className={`px-2.5 py-1 rounded border font-medium transition-colors ${
              overrideState.status === 'active'
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            2. Active Override (2h Countdown)
          </button>
          <button
            onClick={() => simulateBlockedState()}
            className={`px-2.5 py-1 rounded border font-medium transition-colors ${
              overrideState.status === 'blocked'
                ? 'bg-rose-700 text-white border-rose-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            3. Override Blocked State
          </button>
        </div>
      </div>

      {/* STATE 1: OVERRIDE ACCESS BLOCKED */}
      {overrideState.status === 'blocked' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 font-bold text-lg shrink-0">
                □
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1">
                    <span>□</span>
                    <span>OVERRIDE ACCESS BLOCKED</span>
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Status: Review Required</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Emergency Override Capability Temporarily Disabled
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Your emergency override access has been suspended following a road safety
                  compliance review. Virtual speed limits continue to apply normally across all
                  controlled zones.
                </p>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs space-y-1">
                  <div>
                    <span className="text-slate-500 font-medium">Official Reason: </span>
                    <strong className="text-slate-800">
                      {overrideState.blockReason ||
                        'Repeated suspicious override activity following safety audit #SR-892'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Flagging Authority: </span>
                    <span className="text-slate-800">
                      Odisha Road Safety Authority (Automated Audit Cell)
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsVerificationModalOpen(true)}
                    className="px-4 py-2 bg-teal-800 text-white rounded-lg text-xs font-semibold hover:bg-teal-900 transition-colors flex items-center gap-2 shadow-xs"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Submit Verification Request</span>
                  </button>

                  <button
                    onClick={() => alert(`Review Incident Record:
Incident Date: ${verificationRequest.incidentDate}
Time: ${verificationRequest.overrideTime}
Vehicle: ${verificationRequest.vehicleName}
Audit Flag: ${verificationRequest.systemFlag}`)}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    View Review Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Verification Case Progress</span>
              <span className="font-mono text-slate-500 text-[11px]">{verificationRequest.id}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Incident Date</span>
                <strong className="text-slate-900">{verificationRequest.incidentDate}</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Override Window</span>
                <strong className="text-slate-900">{verificationRequest.overrideTime}</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Original Reason</span>
                <strong className="text-slate-900">{verificationRequest.reasonOriginallySelected}</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Review Status</span>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                    verificationRequest.status === 'under_review'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : verificationRequest.status === 'approved' ||
                        verificationRequest.status === 'access_restored'
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : verificationRequest.status === 'rejected'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {verificationRequest.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {verificationRequest.status === 'under_review' && (
              <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Verification Submitted to Review Team</strong>
                  <span>
                    Your explanation and document ({verificationRequest.attachmentName}) are currently being
                    examined by the designated safety compliance board. Expected turnaround: 24 hours.
                  </span>
                </div>
              </div>
            )}

            {/* Simulated verification actions for reviewer evaluation */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <span>Prototype Reviewer Simulator:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => updateVerificationStatus('under_review')}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Set Under Review
                </button>
                <button
                  onClick={() => updateVerificationStatus('approved')}
                  className="px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold"
                >
                  Simulate Approved (Restore Access)
                </button>
                <button
                  onClick={() => updateVerificationStatus('rejected')}
                  className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold"
                >
                  Simulate Rejected
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : overrideState.status === 'active' ? (
        /* STATE 2: OVERRIDE ACTIVE WORKFLOW */
        <div className="space-y-4">
          {/* Main Active Banner */}
          <div className="bg-white rounded-xl border border-amber-300 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xl shrink-0">
                  ◇
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <span>◇</span>
                      <span>EMERGENCY OVERRIDE ACTIVE</span>
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Declared: <strong>{overrideState.reason}</strong>
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Virtual Speed-Zone Restrictions Temporarily Suspended
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Virtual humps and deceleration zones are paused for this emergency vehicle. Proceed
                    with extreme caution through school and hospital corridors.
                  </p>
                </div>
              </div>

              {/* Countdown Timer Display */}
              <div className="bg-amber-50/80 rounded-xl border border-amber-200 p-4 text-center sm:text-right shrink-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1 flex items-center justify-center sm:justify-end gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time Remaining</span>
                </div>
                <div className="text-3xl font-mono font-bold text-amber-950 tabular-nums">
                  {formatTime(overrideState.remainingSeconds)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Max duration: 2 hours (auto-expires)
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Current Speed:</span>
                <span className="font-mono text-slate-900 font-bold">{currentSpeed} km/h</span>
                <span className="text-slate-400">·</span>
                <span>Normal Zone Limit: 30 km/h (Suspended)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => flagOverrideActivity()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                  title="Simulate suspicious deviation"
                >
                  Simulate Flagged Activity
                </button>
                <button
                  onClick={() => endOverride()}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Conclude Emergency Override
                </button>
              </div>
            </div>
          </div>

          {/* Telemetry and AI Monitoring Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Government Live Monitoring Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-teal-800" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Government Safety Monitoring
                  </h3>
                </div>
                <span className="text-xs font-semibold text-teal-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                  <span>TRANSMITTING</span>
                </span>
              </div>

              <p className="text-xs text-slate-600 mb-3">
                To discourage misuse and verify emergency bona fides, continuous safety telemetry is
                streamed directly to state transport dispatch.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-500 text-[11px]">GNSS Coordinates</div>
                  <strong className="text-slate-800">20.2961° N, 85.8245° E</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Vehicle Speed & Acceleration</div>
                  <strong className="text-slate-800">MONITORED ({currentSpeed} km/h)</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-500 text-[11px]">6-Axis Gyro / IMU</div>
                  <strong className="text-slate-800">ACTIVE (No roll anomalies)</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Route & Waypoints</div>
                  <strong className="text-slate-800">RECORDED (Secured Hash)</strong>
                </div>
              </div>
            </div>

            {/* Prototype AI Misuse Monitoring Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-800" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    AI Safety Pattern Analysis (Prototype)
                  </h3>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                    overrideState.flaggedForReview
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  Risk: {overrideState.aiRiskLevel} ({overrideState.aiConfidence}%)
                </span>
              </div>

              {overrideState.flaggedForReview ? (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-300 text-xs text-amber-950 mb-3">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="w-4 h-4" />
                    <span>ACTIVITY FLAGGED FOR REVIEW</span>
                  </div>
                  <p className="mt-1">
                    Your emergency override activity has been flagged for routine post-drive review.
                    Please be prepared to provide medical or dispatch verification if prompted.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-600 mb-3">
                  Autonomous heuristics monitor for repeated activations, prolonged durations, and
                  patterns inconsistent with declared emergencies.
                </p>
              )}

              <div className="space-y-1 text-[11px] text-slate-600">
                {overrideState.aiSignals.map((sig, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="text-teal-700 font-bold" aria-hidden="true">✓</span>
                    <span>{sig}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STATE 3: NORMAL IDLE STATE */
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 sm:p-8 shadow-xs text-center max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 mx-auto mb-4 shadow-xs">
              <AlertOctagon className="w-7 h-7" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 inline-block mb-2">
              Safety Exception Control
            </span>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Emergency Speed-Zone Override
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Temporarily suspends virtual speed restrictions on this vehicle for critical situations
              such as medical emergencies or authorized emergency assistance.
            </p>

            <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-teal-700" />
                <span>Important Safety & Accountability Disclosures</span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-slate-600">
                <li>This is NOT a license to drive unsafely; exercise extreme caution at all times.</li>
                <li>Automatic expiration applies after a maximum duration of 2 hours.</li>
                <li>Full GPS, speed, and IMU telemetry will be logged by the Road Safety Authority.</li>
                <li>Unjustified usage is subject to verification audits and administrative review.</li>
              </ul>
            </div>

            <button
              onClick={handleStartRequest}
              className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.99]"
            >
              Request Emergency Override
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION & REASON SELECTION MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Declare Emergency & Confirm Override
                </h3>
                <p className="text-xs text-slate-500">
                  Vehicle: CargoMesh Demo Vehicle (DL-01-AX-4820)
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This feature temporarily changes how virtual speed restrictions are applied to this
              vehicle. Use only when a genuine emergency requires it.
            </p>

            {/* Recorded Parameters List */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-800 block mb-1">
                The safety system will record:
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                <span>· Vehicle location & route</span>
                <span>· Instantaneous speed</span>
                <span>· Movement & heading</span>
                <span>· IMU / gyro activity</span>
                <span>· Override start & end time</span>
                <span>· Government monitoring: ACTIVE</span>
              </div>
            </div>

            {/* Reason Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Select Nature of Emergency:
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  'Medical Emergency',
                  'Emergency Assistance',
                  'Critical Family Emergency',
                  'Official Emergency Duty',
                  'Other',
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selectedReason === reason
                        ? 'bg-amber-50/80 border-amber-300 font-semibold text-amber-950'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="emergency_reason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason as OverrideReason)}
                      className="accent-amber-700"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Other Explanation Field */}
            {selectedReason === 'Other' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Explain the emergency (Mandatory):
                </label>
                <textarea
                  rows={2}
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Detail the specific emergency situation..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>
            )}

            {errorMessage && (
              <div className="text-xs text-rose-700 font-medium">{errorMessage}</div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmActivation}
                className="px-4 py-2 rounded-lg bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 transition-colors shadow-xs"
              >
                Activate 2-Hour Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFICATION SUBMISSION MODAL */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Emergency Override Verification Submission
                </h3>
                <p className="text-xs text-slate-500">
                  Formal review case: {verificationRequest.id}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs space-y-1">
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div>
                  <span className="text-slate-500">Incident Date: </span>
                  <strong className="text-slate-800">{verificationRequest.incidentDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Override Time: </span>
                  <strong className="text-slate-800">{verificationRequest.overrideTime}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Vehicle: </span>
                  <strong className="text-slate-800">{verificationRequest.vehicleName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Selected Reason: </span>
                  <strong className="text-slate-800">
                    {verificationRequest.reasonOriginallySelected}
                  </strong>
                </div>
              </div>
              <div className="pt-1 text-[11px]">
                <span className="text-slate-500">System Flag: </span>
                <span className="text-rose-800 font-semibold">{verificationRequest.systemFlag}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitVerificationForm} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Please explain why the emergency override was used:
                </label>
                <textarea
                  rows={4}
                  required
                  value={explanationInput}
                  onChange={(e) => setExplanationInput(e.target.value)}
                  placeholder="Provide context regarding the urgency, patient situation, hospital arrival or dispatch orders..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Attach Supporting Documentation (Medical slip, dispatch record, etc.):
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-600">
                  <Upload className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">{attachmentFile}</span>
                  <span className="ml-auto text-[11px] text-teal-800 font-semibold cursor-pointer">
                    Change
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVerification}
                  className="px-4 py-2 rounded-lg bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 transition-colors shadow-xs"
                >
                  {submittingVerification ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
