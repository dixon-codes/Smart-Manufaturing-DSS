import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import SimulationPanel from './components/SimulationPanel';
import UnifiedReport from './components/UnifiedReport';
import { Activity, BarChart3 } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="min-h-screen p-4 bg-slate-950">
            {/* Header */}
            <header className="mb-4">
                <div className="glass-strong rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold gradient-text">Smart Manufacturing DSS</h1>
                                <p className="text-slate-400 text-xs">Real-time monitoring & diagnostics</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 card py-1 px-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-xs font-bold text-slate-300">Live</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'dashboard'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                }`}
                        >
                            <Activity size={16} />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'analytics'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                }`}
                        >
                            <BarChart3 size={16} />
                            Analytics
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>
                {activeTab === 'dashboard' ? (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-4">
                            <Dashboard />
                            <SimulationPanel />
                        </div>
                        <div className="col-span-1">
                            <UnifiedReport />
                        </div>
                    </div>
                ) : (
                    <Analytics />
                )}
            </main>
        </div>
    );
}

export default App;
