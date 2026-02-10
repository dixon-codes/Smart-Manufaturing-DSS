import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { getMachines } from '../api';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Server, Bell, Grid3x3, List, Table2 } from 'lucide-react';
import MachineDetailModal from './MachineDetailModal';
import ControlPanel from './ControlPanel';

const Dashboard = () => {
    const [machines, setMachines] = useState([]);
    const [filteredMachines, setFilteredMachines] = useState([]);
    const [stats, setStats] = useState({ normal: 0, critical: 0, total: 500 });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [isModalMaximized, setIsModalMaximized] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Debounce timer ref
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        fetchMachines();
        const interval = setInterval(fetchMachines, 3000);
        return () => clearInterval(interval);
    }, []);

    // Apply filters when machines, searchTerm, or filterStatus changes
    useEffect(() => {
        applyFilters();
    }, [machines, searchTerm, filterStatus]);

    const fetchMachines = async () => {
        try {
            const response = await getMachines();
            const data = response.data;
            setMachines(data);

            const critical = data.filter(m => m.status === 'Critical').length;
            const normal = data.filter(m => m.status === 'Normal').length;
            setStats({ normal, critical, total: data.length });

            const newCritical = data.filter(m => m.status === 'Critical' &&
                !notifications.find(n => n.machineId === m.machine_id));
            if (newCritical.length > 0) {
                setNotifications(prev => [
                    ...newCritical.map(m => ({
                        machineId: m.machine_id,
                        timestamp: new Date(),
                        message: `Machine #${m.machine_id} critical`
                    })),
                    ...prev
                ].slice(0, 5));
            }

            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching machines:", error);
            setIsLoading(false);
        }
    };

    const applyFilters = useCallback(() => {
        let filtered = machines;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(m =>
                m.machine_id.toString().includes(searchTerm)
            );
        }

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(m => m.status === filterStatus);
        }

        setFilteredMachines(filtered);
    }, [machines, searchTerm, filterStatus]);

    // Debounced search handler
    const handleSearch = useCallback((value) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setSearchTerm(value);
        }, 150); // 150ms debounce
    }, []);

    const handleFilter = useCallback((status) => {
        setFilterStatus(status);
    }, []);

    const handleExport = useCallback((format) => {
        const dataToExport = filteredMachines.map(m => ({
            machine_id: m.machine_id,
            status: m.status,
            temperature: m.temperature,
            vibration: m.vibration,
            power_usage: m.power_usage,
            production_output: m.production_output,
            timestamp: m.timestamp
        }));

        if (format === 'csv') {
            const headers = Object.keys(dataToExport[0]).join(',');
            const rows = dataToExport.map(row => Object.values(row).join(','));
            const csv = [headers, ...rows].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `machines_${Date.now()}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } else if (format === 'json') {
            const json = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `machines_${Date.now()}.json`;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }, [filteredMachines]);

    const handleRefresh = useCallback(() => {
        setIsLoading(true);
        fetchMachines();
    }, []);

    const getStatusColor = useCallback((status) => {
        return status === 'Critical' ? 'bg-red-500' : 'bg-emerald-500';
    }, []);

    const healthPercentage = useMemo(() =>
        ((stats.normal / stats.total) * 100).toFixed(1),
        [stats.normal, stats.total]
    );

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setFilterStatus('all');
    }, []);

    // Grid View - Optimized
    const GridView = useMemo(() => (
        <div className="grid grid-cols-25 gap-1 h-96 overflow-y-auto custom-scrollbar p-1">
            {filteredMachines.map((machine) => (
                <button
                    key={machine.machine_id}
                    onClick={() => setSelectedMachine(machine)}
                    className={`w-full h-6 rounded ${getStatusColor(machine.status)} 
                        text-[9px] font-mono text-white font-bold machine-cell`}
                    title={`#${machine.machine_id}: ${machine.status}`}
                >
                    {machine.machine_id}
                </button>
            ))}
        </div>
    ), [filteredMachines, getStatusColor]);

    // List View
    const ListView = useMemo(() => (
        <div className="h-96 overflow-y-auto custom-scrollbar space-y-1">
            {filteredMachines.map((machine) => (
                <button
                    key={machine.machine_id}
                    onClick={() => setSelectedMachine(machine)}
                    className="w-full card hover:bg-slate-700 transition-colors text-left p-3"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(machine.status)}`}></div>
                            <div className="text-sm">
                                <div className="font-bold text-slate-200">Machine #{machine.machine_id}</div>
                                <div className="text-xs text-slate-400">
                                    T:{machine.temperature}°C V:{machine.vibration} P:{machine.power_usage}kW
                                </div>
                            </div>
                        </div>
                        <span className={`status-badge ${machine.status === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                            {machine.status}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    ), [filteredMachines, getStatusColor]);

    // Table View
    const TableView = useMemo(() => (
        <div className="h-96 overflow-auto custom-scrollbar">
            <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-800 border-b border-slate-700">
                    <tr className="text-left text-slate-400 text-xs">
                        <th className="p-2">ID</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Temp</th>
                        <th className="p-2">Vib</th>
                        <th className="p-2">Power</th>
                        <th className="p-2">Output</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMachines.map((machine) => (
                        <tr
                            key={machine.machine_id}
                            onClick={() => setSelectedMachine(machine)}
                            className="border-b border-slate-700/50 hover:bg-slate-700 cursor-pointer"
                        >
                            <td className="p-2 font-mono font-bold">#{machine.machine_id}</td>
                            <td className="p-2">
                                <span className={`status-badge ${machine.status === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                    {machine.status}
                                </span>
                            </td>
                            <td className="p-2">{machine.temperature}°C</td>
                            <td className="p-2">{machine.vibration}</td>
                            <td className="p-2">{machine.power_usage}kW</td>
                            <td className="p-2">{machine.production_output}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ), [filteredMachines]);

    return (
        <div className="glass-strong rounded-lg p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold gradient-text">Live Status</h2>
                        <p className="text-slate-400 text-xs">{stats.total} machines</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {notifications.length > 0 && (
                        <div className="relative group">
                            <button
                                onClick={() => {
                                    // Show the first critical machine
                                    const criticalMachine = machines.find(m => m.status === 'Critical');
                                    if (criticalMachine) {
                                        setSelectedMachine(criticalMachine);
                                    }
                                }}
                                className="btn-icon relative hover:bg-red-500/20 transition-colors"
                                title={`${notifications.length} critical alert${notifications.length > 1 ? 's' : ''} - click to view`}
                            >
                                <Bell className="w-4 h-4 text-red-400" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs
                                    flex items-center justify-center text-white font-bold">
                                    {notifications.length}
                                </span>
                            </button>

                            {/* Tooltip */}
                            <div className="absolute top-full right-0 mt-2 w-64 card hidden group-hover:block z-50 animate-fadeIn">
                                <div className="text-xs font-bold text-red-400 mb-2">Recent Critical Alerts</div>
                                <div className="space-y-1">
                                    {notifications.slice(0, 3).map((notif, idx) => (
                                        <div key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                            Machine #{notif.machineId}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-xs text-blue-400 mt-2">Click to view details</div>
                            </div>
                        </div>
                    )}

                    <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-400">{healthPercentage}%</div>
                        <div className="text-xs text-slate-400">Health</div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="card border-l-2 border-blue-500">
                    <div className="text-lg font-bold">{stats.total}</div>
                    <div className="text-xs text-slate-400">Total</div>
                </div>
                <div className="card border-l-2 border-emerald-500">
                    <div className="text-lg font-bold text-emerald-400">{stats.normal}</div>
                    <div className="text-xs text-slate-400">Normal</div>
                </div>
                <div className="card border-l-2 border-red-500">
                    <div className="text-lg font-bold text-red-400">{stats.critical}</div>
                    <div className="text-xs text-slate-400">Critical</div>
                </div>
            </div>

            {/* Control Panel */}
            <ControlPanel
                onSearch={handleSearch}
                onFilter={handleFilter}
                onExport={handleExport}
                onRefresh={handleRefresh}
                onClearFilters={clearFilters}
                currentFilter={filterStatus}
            />

            {/* View Selector & Info */}
            <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-400">
                    {filteredMachines.length} / {machines.length} machines
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`btn-icon ${viewMode === 'grid' ? 'bg-blue-600 text-white' : ''}`}
                        title="Grid"
                    >
                        <Grid3x3 size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`btn-icon ${viewMode === 'list' ? 'bg-blue-600 text-white' : ''}`}
                        title="List"
                    >
                        <List size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`btn-icon ${viewMode === 'table' ? 'bg-blue-600 text-white' : ''}`}
                        title="Table"
                    >
                        <Table2 size={16} />
                    </button>
                </div>
            </div>

            {/* Machine Display */}
            {isLoading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="spinner h-8 w-8 border-blue-500"></div>
                </div>
            ) : (
                <div className="card">
                    {viewMode === 'grid' && GridView}
                    {viewMode === 'list' && ListView}
                    {viewMode === 'table' && TableView}
                </div>
            )}

            {/* Machine Detail Modal */}
            {selectedMachine && (
                <MachineDetailModal
                    machine={selectedMachine}
                    onClose={() => {
                        setSelectedMachine(null);
                        setIsModalMaximized(false);
                    }}
                    isMaximized={isModalMaximized}
                    onToggleMaximize={() => setIsModalMaximized(!isModalMaximized)}
                />
            )}
        </div>
    );
};

export default React.memo(Dashboard);
