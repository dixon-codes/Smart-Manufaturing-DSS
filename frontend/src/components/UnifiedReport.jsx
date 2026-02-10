import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getDiagnoses, resolveDiagnosis } from '../api';
import { AlertTriangle, Wrench, Clock, Info, ChevronRight, Check, X } from 'lucide-react';

const DiagnosisDetailModal = ({ diagnosis, onClose, onResolve }) => {
    const [resolving, setResolving] = useState(false);
    const [notes, setNotes] = useState('');

    const handleResolve = async () => {
        setResolving(true);
        try {
            await onResolve(diagnosis.id, notes);
            onClose();
        } catch (error) {
            console.error("Failed to resolve:", error);
        } finally {
            setResolving(false);
        }
    };

    if (!diagnosis) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass-strong rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={`${diagnosis.severity === 'Critical' ? 'bg-red-600' : 'bg-yellow-600'} p-4 rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="text-white" size={24} />
                            <div>
                                <h2 className="text-xl font-bold text-white">Machine #{diagnosis.machine_id}</h2>
                                <p className="text-white/80 text-sm">Fault Diagnosis</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    <div className="card">
                        <div className="text-lg font-bold text-red-400 mb-1">{diagnosis.issue_detected}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(diagnosis.timestamp).toLocaleString()}
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-1 mb-2">
                            <Info className="text-blue-400" size={16} />
                            <span className="text-sm font-bold text-slate-300">Reasoning</span>
                        </div>
                        <p className="text-sm text-slate-300">{diagnosis.reasoning}</p>
                    </div>

                    <div className="card border-l-2 border-emerald-500">
                        <div className="flex items-center gap-1 mb-2">
                            <Wrench className="text-emerald-400" size={16} />
                            <span className="text-sm font-bold text-emerald-400">Action Required</span>
                        </div>
                        <p className="text-sm text-slate-200">{diagnosis.corrective_action}</p>
                    </div>

                    {!diagnosis.resolved && (
                        <>
                            <div className="card">
                                <label className="text-sm font-bold text-slate-300 mb-2 block">
                                    Resolution Notes (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add notes about how this was resolved..."
                                    className="w-full input-field resize-none"
                                    rows="3"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
                                <button
                                    onClick={handleResolve}
                                    disabled={resolving}
                                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                                >
                                    {resolving ? (
                                        <>
                                            <div className="spinner h-4 w-4 border-white"></div>
                                            Resolving...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            Mark Resolved
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {diagnosis.resolved && (
                        <div className="card bg-emerald-500/10 border-l-2 border-emerald-500">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                                <Check size={16} />
                                Resolved
                            </div>
                            <div className="text-xs text-slate-400">
                                <div>By: {diagnosis.resolved_by}</div>
                                <div>At: {new Date(diagnosis.resolved_at).toLocaleString()}</div>
                                {diagnosis.resolution_notes && (
                                    <div className="mt-2 text-slate-300">Notes: {diagnosis.resolution_notes}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const UnifiedReport = () => {
    const [diagnoses, setDiagnoses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
    const [showResolved, setShowResolved] = useState(false);
    const [severityFilter, setSeverityFilter] = useState('all'); // all, Critical, Warning

    useEffect(() => {
        fetchDiagnoses();
        const interval = setInterval(fetchDiagnoses, 4000);
        return () => clearInterval(interval);
    }, [showResolved]);

    const fetchDiagnoses = useCallback(async () => {
        try {
            const response = await getDiagnoses(showResolved ? null : false);
            setDiagnoses(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error:", error);
            setIsLoading(false);
        }
    }, [showResolved]);

    const handleResolve = useCallback(async (diagnosisId, notes) => {
        await resolveDiagnosis(diagnosisId, notes);
        fetchDiagnoses();
    }, [fetchDiagnoses]);

    const getSeverityColor = useCallback((severity) => {
        return severity === 'Critical' ? 'bg-red-600' : 'bg-yellow-600';
    }, []);

    // Filter diagnoses by severity
    const filteredDiagnoses = useMemo(() => {
        if (severityFilter === 'all') return diagnoses;
        return diagnoses.filter(d => d.severity === severityFilter);
    }, [diagnoses, severityFilter]);

    const activeCount = diagnoses.filter(d => !d.resolved).length;
    const criticalCount = diagnoses.filter(d => !d.resolved && d.severity === 'Critical').length;
    const warningCount = diagnoses.filter(d => !d.resolved && d.severity === 'Warning').length;

    return (
        <div className="glass-strong rounded-lg p-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-orange-600 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold gradient-text">Expert System</h2>
                    <p className="text-slate-400 text-xs">AI diagnostics</p>
                </div>
                <button
                    onClick={() => setShowResolved(!showResolved)}
                    className={`btn-secondary text-xs ${showResolved ? 'bg-blue-600 text-white' : ''}`}
                >
                    {showResolved ? 'All' : 'Active'}
                </button>
            </div>

            {/* Stats with Filters */}
            <div className="space-y-2 mb-3">
                <div className="card flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-slate-300">Active Alerts</span>
                    </div>
                    <span className="status-badge bg-red-500/20 text-red-400">{activeCount}</span>
                </div>

                {/* Severity Filter Buttons */}
                <div className="grid grid-cols-3 gap-1">
                    <button
                        onClick={() => setSeverityFilter('all')}
                        className={`card py-2 text-xs font-bold transition-colors ${severityFilter === 'all' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'
                            }`}
                    >
                        All ({activeCount})
                    </button>
                    <button
                        onClick={() => setSeverityFilter('Critical')}
                        className={`card py-2 text-xs font-bold transition-colors ${severityFilter === 'Critical' ? 'bg-red-600 text-white' : 'hover:bg-slate-700 text-red-400'
                            }`}
                    >
                        Critical ({criticalCount})
                    </button>
                    <button
                        onClick={() => setSeverityFilter('Warning')}
                        className={`card py-2 text-xs font-bold transition-colors ${severityFilter === 'Warning' ? 'bg-yellow-600 text-white' : 'hover:bg-slate-700 text-yellow-400'
                            }`}
                    >
                        Warning ({warningCount})
                    </button>
                </div>
            </div>

            {/* Diagnoses List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="spinner h-8 w-8 border-orange-500"></div>
                    </div>
                ) : filteredDiagnoses.length === 0 ? (
                    <div className="card text-center h-full flex flex-col items-center justify-center">
                        <Check className="w-12 h-12 text-emerald-400 mb-2" />
                        <div className="font-bold text-emerald-400">
                            {severityFilter === 'all' ? 'All Clear!' : `No ${severityFilter} Alerts`}
                        </div>
                        <div className="text-slate-500 text-sm">
                            {severityFilter === 'all' ? 'No active faults' : `No ${severityFilter.toLowerCase()} faults detected`}
                        </div>
                    </div>
                ) : (
                    filteredDiagnoses.map((diag, index) => (
                        <button
                            key={`${diag.id}-${index}`}
                            onClick={() => setSelectedDiagnosis(diag)}
                            className={`w-full card hover:bg-slate-700 cursor-pointer text-left ${diag.resolved ? 'opacity-60' : ''
                                }`}
                        >
                            <div className={`${getSeverityColor(diag.severity)} px-3 py-2 rounded-t-lg -m-4 mb-2 
                                flex items-center justify-between`}>
                                <div className="flex items-center gap-2">
                                    {diag.resolved ? (
                                        <Check size={14} className="text-white" />
                                    ) : (
                                        <AlertTriangle size={14} className="text-white" />
                                    )}
                                    <span className="font-bold text-white text-sm">Machine #{diag.machine_id}</span>
                                </div>
                                <div className="flex items-center gap-1 text-white/80 text-xs">
                                    <Clock size={10} />
                                    {new Date(diag.timestamp).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-bold text-red-400">{diag.issue_detected}</div>
                                <div className="text-xs text-slate-400 line-clamp-2">{diag.reasoning}</div>
                                <div className="text-xs text-blue-400 flex items-center gap-1">
                                    Click for details <ChevronRight size={12} />
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>

            {selectedDiagnosis && (
                <DiagnosisDetailModal
                    diagnosis={selectedDiagnosis}
                    onClose={() => setSelectedDiagnosis(null)}
                    onResolve={handleResolve}
                />
            )}
        </div>
    );
};

export default React.memo(UnifiedReport);
