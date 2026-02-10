import React, { useState, useCallback, useMemo } from 'react';
import { runSimulation } from '../api';
import { Sliders, Zap, AlertOctagon, Activity, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const SimulationPanel = () => {
    const [capacity, setCapacity] = useState(1.0);
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSimulate = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await runSimulation(capacity);
            setResult(response.data);
        } catch (error) {
            console.error("Simulation error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [capacity]);

    const status = useMemo(() => {
        if (capacity < 0.7) return { color: 'text-blue-400', bgColor: 'bg-blue-500/10', label: 'Under-utilized', icon: TrendingDown };
        if (capacity > 1.2) return { color: 'text-red-400', bgColor: 'bg-red-500/10', label: 'Overload', icon: AlertOctagon };
        return { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', label: 'Optimal', icon: Activity };
    }, [capacity]);

    const StatusIcon = status.icon;

    return (
        <div className="glass-strong rounded-lg p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-600 rounded-lg">
                    <Sliders className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold gradient-text">What-If Simulation</h2>
                    <p className="text-slate-400 text-xs">Predict cost & risk impact</p>
                </div>
            </div>

            {/* Capacity Slider */}
            <div className="card mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-300">Capacity Level</span>
                    <div className={`flex items-center gap-1 ${status.color} text-xs font-bold px-2 py-1 rounded ${status.bgColor}`}>
                        <StatusIcon size={14} />
                        {status.label}
                    </div>
                </div>

                <div className="relative mb-6">
                    <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={capacity}
                        onChange={(e) => setCapacity(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 card px-3 py-1">
                        <div className="text-xl font-bold gradient-text">{(capacity * 100).toFixed(0)}%</div>
                    </div>
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                    <span>50%</span>
                    <span className="font-bold text-slate-400">100%</span>
                    <span>150%</span>
                </div>
            </div>

            {/* Run Button */}
            <button
                onClick={handleSimulate}
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2 mb-4"
            >
                {isLoading ? (
                    <>
                        <div className="spinner h-4 w-4 border-white"></div>
                        Running...
                    </>
                ) : (
                    <>
                        <Zap size={18} />
                        Run Prediction
                    </>
                )}
            </button>

            {/* Results */}
            {result && (
                <div className="space-y-3">
                    {/* Recommendation */}
                    <div className={`card border-l-4 ${result.severity === 'high' ? 'border-red-500 bg-red-500/5' :
                            result.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/5' :
                                'border-emerald-500 bg-emerald-500/5'
                        }`}>
                        <div className="text-xs font-bold text-slate-400 mb-1">RECOMMENDATION</div>
                        <div className="text-sm text-slate-200">{result.recommendation}</div>
                        <div className="text-xs text-slate-500 mt-2">
                            Optimal: {(result.optimal_capacity * 100).toFixed(0)}% • {result.affected_machines} machines affected
                        </div>
                    </div>

                    {/* Energy & Risk */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="card border-l-2 border-blue-500">
                            <div className="text-xs text-slate-400 mb-1">Energy</div>
                            <div className="text-xl font-bold text-blue-400">{result.predicted_energy}</div>
                            <div className="text-xs text-slate-500">kWh</div>
                        </div>
                        <div className="card border-l-2 border-red-500">
                            <div className="text-xs text-slate-400 mb-1">Failure Risk</div>
                            <div className="text-xl font-bold text-red-400">+{result.failure_risk_increase}%</div>
                            <div className="text-xs text-slate-500">Increase</div>
                        </div>
                    </div>

                    {/* Cost Analysis */}
                    <div className="card bg-slate-900/50">
                        <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="text-emerald-400" size={16} />
                            <span className="text-sm font-bold text-emerald-400">Cost Impact Analysis</span>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Energy Cost:</span>
                                <span className="font-mono text-slate-200">${result.energy_cost_usd}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">vs Baseline:</span>
                                <span className={`font-mono ${result.cost_impact_usd > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {result.cost_impact_usd > 0 ? '+' : ''}${result.cost_impact_usd}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Maintenance Risk:</span>
                                <span className="font-mono text-yellow-400">+${result.maintenance_cost_usd}</span>
                            </div>
                            <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between font-bold">
                                <span className="text-slate-300">Total Impact:</span>
                                <span className={`font-mono text-lg ${result.total_cost_impact_usd > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {result.total_cost_impact_usd > 0 ? '+' : ''}${result.total_cost_impact_usd}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(SimulationPanel);
