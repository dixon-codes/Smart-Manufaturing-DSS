import React, { useEffect, useState } from 'react';
import { getMachines, getDiagnoses } from '../api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, Zap, Activity, Clock } from 'lucide-react';

const Analytics = () => {
    const [machines, setMachines] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [machinesRes, diagnosesRes] = await Promise.all([
                getMachines(),
                getDiagnoses()
            ]);

            const machineData = machinesRes.data;
            const diagnosisData = diagnosesRes.data;

            setMachines(machineData);
            setDiagnoses(diagnosisData);

            // Calculate analytics
            calculateAnalytics(machineData, diagnosisData);
        } catch (error) {
            console.error("Error fetching analytics data:", error);
        }
    };

    const calculateAnalytics = (machineData, diagnosisData) => {
        // Status distribution
        const statusDist = {
            Normal: machineData.filter(m => m.status === 'Normal').length,
            Critical: machineData.filter(m => m.status === 'Critical').length
        };

        // Temperature distribution
        const tempRanges = {
            'Low (< 60°C)': machineData.filter(m => m.temperature < 60).length,
            'Normal (60-80°C)': machineData.filter(m => m.temperature >= 60 && m.temperature < 80).length,
            'High (80-100°C)': machineData.filter(m => m.temperature >= 80 && m.temperature < 100).length,
            'Critical (> 100°C)': machineData.filter(m => m.temperature >= 100).length
        };

        // Power consumption ranges
        const powerRanges = {
            'Low (< 8kW)': machineData.filter(m => m.power_usage < 8).length,
            'Normal (8-12kW)': machineData.filter(m => m.power_usage >= 8 && m.power_usage < 12).length,
            'High (12-15kW)': machineData.filter(m => m.power_usage >= 12 && m.power_usage < 15).length,
            'Critical (> 15kW)': machineData.filter(m => m.power_usage >= 15).length
        };

        // Top issues
        const issueCount = {};
        diagnosisData.forEach(d => {
            issueCount[d.issue_detected] = (issueCount[d.issue_detected] || 0) + 1;
        });
        const topIssues = Object.entries(issueCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([issue, count]) => ({ issue, count }));

        // Average metrics
        const avgTemp = (machineData.reduce((sum, m) => sum + m.temperature, 0) / machineData.length).toFixed(1);
        const avgVib = (machineData.reduce((sum, m) => sum + m.vibration, 0) / machineData.length).toFixed(1);
        const avgPower = (machineData.reduce((sum, m) => sum + m.power_usage, 0) / machineData.length).toFixed(1);
        const avgProduction = (machineData.reduce((sum, m) => sum + m.production_output, 0) / machineData.length).toFixed(0);

        setAnalytics({
            statusDist,
            tempRanges,
            powerRanges,
            topIssues,
            averages: { avgTemp, avgVib, avgPower, avgProduction }
        });
    };

    if (!analytics) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

    const statusData = [
        { name: 'Normal', value: analytics.statusDist.Normal, color: '#10b981' },
        { name: 'Critical', value: analytics.statusDist.Critical, color: '#ef4444' }
    ];

    const tempData = Object.entries(analytics.tempRanges).map(([name, value]) => ({ name, value }));
    const powerData = Object.entries(analytics.powerRanges).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="glass-strong rounded-2xl p-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold gradient-text">Analytics Dashboard</h2>
                        <p className="text-slate-400 text-sm">System-wide performance metrics and insights</p>
                    </div>
                </div>
            </div>

            {/* Average Metrics */}
            <div className="grid grid-cols-4 gap-4">
                <div className="glass-strong rounded-xl p-5 border-l-4 border-orange-500">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity size={18} className="text-orange-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Avg Temperature</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-400">{analytics.averages.avgTemp}°C</div>
                </div>
                <div className="glass-strong rounded-xl p-5 border-l-4 border-purple-500">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity size={18} className="text-purple-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Avg Vibration</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-400">{analytics.averages.avgVib} mm/s</div>
                </div>
                <div className="glass-strong rounded-xl p-5 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap size={18} className="text-blue-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Avg Power</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-400">{analytics.averages.avgPower} kW</div>
                </div>
                <div className="glass-strong rounded-xl p-5 border-l-4 border-emerald-500">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={18} className="text-emerald-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Avg Production</span>
                    </div>
                    <div className="text-3xl font-bold text-emerald-400">{analytics.averages.avgProduction} u/h</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="glass-strong rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-200 mb-4">Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Temperature Distribution */}
                <div className="glass-strong rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-200 mb-4">Temperature Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={tempData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={80} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="value" fill="#f97316" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Power Distribution */}
                <div className="glass-strong rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-200 mb-4">Power Consumption Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={powerData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={80} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Issues */}
                <div className="glass-strong rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-red-400" />
                        Top 5 Issues
                    </h3>
                    <div className="space-y-3">
                        {analytics.topIssues.length > 0 ? (
                            analytics.topIssues.map((issue, idx) => (
                                <div key={idx} className="glass rounded-lg p-3 flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-slate-200">{issue.issue}</div>
                                        <div className="text-xs text-slate-500">Occurrences: {issue.count}</div>
                                    </div>
                                    <div className="text-2xl font-bold text-red-400">{issue.count}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 py-8">
                                No issues detected
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
