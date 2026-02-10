import React from 'react';
import { X, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Thermometer, Activity, Zap, Maximize2, Power, RotateCw, Wrench, Play, Square } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MachineDetailModal = ({ machine, onClose, history = [], isMaximized = false, onToggleMaximize }) => {
    if (!machine) return null;

    const [machineStatus, setMachineStatus] = React.useState(machine.status);
    const [operationalMode, setOperationalMode] = React.useState('Running');

    const getStatusIcon = () => {
        if (machineStatus === 'Critical') return <AlertTriangle className="text-red-400" size={24} />;
        return <CheckCircle className="text-emerald-400" size={24} />;
    };

    const getTrendIcon = (current, avg) => {
        const diff = ((current - avg) / avg) * 100;
        if (diff > 5) return <TrendingUp className="text-red-400" size={16} />;
        if (diff < -5) return <TrendingDown className="text-emerald-400" size={16} />;
        return <Minus className="text-slate-400" size={16} />;
    };

    // Mock historical data
    const mockHistory = history.length > 0 ? history : [
        { time: '10:00', temperature: 65, vibration: 2.1, power: 8.5 },
        { time: '10:05', temperature: 68, vibration: 2.3, power: 9.0 },
        { time: '10:10', temperature: 72, vibration: 2.8, power: 9.5 },
        { time: '10:15', temperature: machine.temperature, vibration: machine.vibration, power: machine.power_usage },
    ];

    const avgTemp = mockHistory.reduce((sum, d) => sum + d.temperature, 0) / mockHistory.length;
    const avgVib = mockHistory.reduce((sum, d) => sum + d.vibration, 0) / mockHistory.length;
    const avgPower = mockHistory.reduce((sum, d) => sum + d.power, 0) / mockHistory.length;

    const handleMachineControl = (action) => {
        console.log(`Machine ${machine.machine_id}: ${action}`);
        // In real app, this would call an API
        switch (action) {
            case 'start':
                setOperationalMode('Running');
                setMachineStatus('Normal');
                break;
            case 'stop':
                setOperationalMode('Stopped');
                break;
            case 'restart':
                setOperationalMode('Restarting...');
                setTimeout(() => setOperationalMode('Running'), 2000);
                break;
            case 'maintenance':
                setOperationalMode('Maintenance Mode');
                break;
            default:
                break;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
            <div className={`glass-strong rounded-2xl shadow-2xl ${isMaximized ? 'w-full h-full' : 'max-w-4xl w-full max-h-[90vh]'
                } overflow-y-auto custom-scrollbar transition-all duration-300`}>
                {/* Header */}
                <div className="sticky top-0 glass-strong border-b border-slate-700/50 p-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${machineStatus === 'Critical' ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                            {getStatusIcon()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold gradient-text">Machine #{machine.machine_id}</h2>
                            <p className="text-slate-400 text-sm">Detailed diagnostics and controls</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onToggleMaximize}
                            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                            title={isMaximized ? "Restore" : "Maximize"}
                        >
                            <Maximize2 size={20} className="text-slate-400" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className={`p-6 ${isMaximized ? 'grid grid-cols-2 gap-6' : 'space-y-6'}`}>
                    {/* Left Column / Main Content */}
                    <div className="space-y-6">
                        {/* Status & Mode */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass rounded-xl p-4">
                                <span className="text-slate-400 text-sm">Status</span>
                                <div className={`mt-1 status-badge ${machineStatus === 'Critical'
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                    {machineStatus}
                                </div>
                            </div>
                            <div className="glass rounded-xl p-4">
                                <span className="text-slate-400 text-sm">Mode</span>
                                <div className="mt-1 status-badge bg-blue-500/20 text-blue-400">
                                    {operationalMode}
                                </div>
                            </div>
                        </div>

                        {/* Machine Controls */}
                        <div className="glass-strong rounded-xl p-5">
                            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                                <Power size={20} className="text-blue-400" />
                                Machine Controls
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleMachineControl('start')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 
                                        text-white rounded-lg transition-colors font-medium"
                                >
                                    <Play size={18} />
                                    Start
                                </button>
                                <button
                                    onClick={() => handleMachineControl('stop')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 
                                        text-white rounded-lg transition-colors font-medium"
                                >
                                    <Square size={18} />
                                    Stop
                                </button>
                                <button
                                    onClick={() => handleMachineControl('restart')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 
                                        text-white rounded-lg transition-colors font-medium"
                                >
                                    <RotateCw size={18} />
                                    Restart
                                </button>
                                <button
                                    onClick={() => handleMachineControl('maintenance')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 
                                        text-white rounded-lg transition-colors font-medium"
                                >
                                    <Wrench size={18} />
                                    Maintenance
                                </button>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="glass-strong rounded-xl p-5 border-l-4 border-orange-500">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Thermometer size={20} className="text-orange-400" />
                                        <span className="text-xs text-slate-400 uppercase tracking-wider">Temp</span>
                                    </div>
                                    {getTrendIcon(machine.temperature, avgTemp)}
                                </div>
                                <div className="text-3xl font-bold text-orange-400">{machine.temperature}°C</div>
                                <div className="text-xs text-slate-500 mt-1">Avg: {avgTemp.toFixed(1)}°C</div>
                            </div>

                            <div className="glass-strong rounded-xl p-5 border-l-4 border-purple-500">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Activity size={20} className="text-purple-400" />
                                        <span className="text-xs text-slate-400 uppercase tracking-wider">Vib</span>
                                    </div>
                                    {getTrendIcon(machine.vibration, avgVib)}
                                </div>
                                <div className="text-3xl font-bold text-purple-400">{machine.vibration}</div>
                                <div className="text-xs text-slate-500 mt-1">Avg: {avgVib.toFixed(1)}</div>
                            </div>

                            <div className="glass-strong rounded-xl p-5 border-l-4 border-blue-500">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Zap size={20} className="text-blue-400" />
                                        <span className="text-xs text-slate-400 uppercase tracking-wider">Power</span>
                                    </div>
                                    {getTrendIcon(machine.power_usage, avgPower)}
                                </div>
                                <div className="text-3xl font-bold text-blue-400">{machine.power_usage}</div>
                                <div className="text-xs text-slate-500 mt-1">Avg: {avgPower.toFixed(1)}</div>
                            </div>
                        </div>

                        {/* Production Output */}
                        <div className="glass rounded-xl p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">Production Output</div>
                                    <div className="text-2xl font-bold text-slate-100">{machine.production_output} units/hr</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-slate-400">Efficiency</div>
                                    <div className={`text-xl font-bold ${machine.production_output > 85 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                        {machine.production_output}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column / Charts (only in maximized mode) or Charts below */}
                    <div className="space-y-6">
                        {/* Historical Charts */}
                        <div className="glass-strong rounded-xl p-5">
                            <h3 className="text-lg font-bold text-slate-200 mb-4">Performance Trends</h3>

                            {/* Temperature Chart */}
                            <div className="mb-6">
                                <div className="text-sm text-slate-400 mb-2">Temperature (°C)</div>
                                <ResponsiveContainer width="100%" height={isMaximized ? 150 : 120}>
                                    <LineChart data={mockHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                        <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid #334155',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Vibration Chart */}
                            <div className="mb-6">
                                <div className="text-sm text-slate-400 mb-2">Vibration (mm/s)</div>
                                <ResponsiveContainer width="100%" height={isMaximized ? 150 : 120}>
                                    <LineChart data={mockHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                        <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid #334155',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Line type="monotone" dataKey="vibration" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Power Chart */}
                            <div>
                                <div className="text-sm text-slate-400 mb-2">Power Usage (kW)</div>
                                <ResponsiveContainer width="100%" height={isMaximized ? 150 : 120}>
                                    <LineChart data={mockHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                        <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid #334155',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Line type="monotone" dataKey="power" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Additional Info in Maximized Mode */}
                        {isMaximized && (
                            <div className="glass-strong rounded-xl p-5">
                                <h3 className="text-lg font-bold text-slate-200 mb-4">Additional Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Last Maintenance:</span>
                                        <span className="text-slate-200">2024-01-15</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Next Scheduled:</span>
                                        <span className="text-slate-200">2024-03-15</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Operating Hours:</span>
                                        <span className="text-slate-200">12,450 hrs</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Uptime:</span>
                                        <span className="text-emerald-400">98.5%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Location:</span>
                                        <span className="text-slate-200">Floor 2, Section B</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timestamp */}
                    <div className={`text-center text-sm text-slate-500 ${isMaximized ? 'col-span-2' : ''}`}>
                        Last Updated: {new Date(machine.timestamp).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MachineDetailModal;
