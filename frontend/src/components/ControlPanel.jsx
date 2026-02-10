import React, { useState } from 'react';
import { Search, Filter, Download, RefreshCw, FileDown, X } from 'lucide-react';

const ControlPanel = ({ onSearch, onFilter, onExport, onRefresh, onClearFilters, currentFilter }) => {
    const [searchValue, setSearchValue] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        onSearch(value);
    };

    const handleFilterClick = (status) => {
        onFilter(status);
        setShowFilterMenu(false);
    };

    const handleExportClick = (format) => {
        onExport(format);
        setShowExportMenu(false);
    };

    const handleRefreshClick = async () => {
        setIsRefreshing(true);
        onRefresh();
        setTimeout(() => setIsRefreshing(false), 800);
    };

    const handleClearSearch = () => {
        setSearchValue('');
        onSearch('');
    };

    const handleClearAll = () => {
        setSearchValue('');
        onClearFilters();
    };

    const hasActiveFilters = searchValue || currentFilter !== 'all';

    return (
        <div className="card mb-4">
            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by ID..."
                        value={searchValue}
                        onChange={handleSearchChange}
                        className="w-full pl-8 pr-8 py-2 input-field text-sm"
                    />
                    {searchValue && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filter */}
                <div className="relative">
                    <button
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className={`btn-secondary flex items-center gap-1 text-sm ${currentFilter !== 'all' ? 'bg-blue-600 text-white' : ''
                            }`}
                    >
                        <Filter size={16} />
                        Filter
                    </button>

                    {showFilterMenu && (
                        <div className="absolute top-full mt-1 right-0 glass-strong rounded-lg z-20 min-w-[120px] py-1">
                            <button
                                onClick={() => handleFilterClick('all')}
                                className={`w-full text-left px-3 py-2 hover:bg-slate-700 text-sm ${currentFilter === 'all' ? 'text-blue-400 font-bold' : ''
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleFilterClick('Normal')}
                                className={`w-full text-left px-3 py-2 hover:bg-slate-700 text-sm ${currentFilter === 'Normal' ? 'text-emerald-400 font-bold' : ''
                                    }`}
                            >
                                Normal
                            </button>
                            <button
                                onClick={() => handleFilterClick('Critical')}
                                className={`w-full text-left px-3 py-2 hover:bg-slate-700 text-sm ${currentFilter === 'Critical' ? 'text-red-400 font-bold' : ''
                                    }`}
                            >
                                Critical
                            </button>
                        </div>
                    )}
                </div>

                {/* Export */}
                <div className="relative">
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="btn-secondary flex items-center gap-1 text-sm"
                    >
                        <Download size={16} />
                        Export
                    </button>

                    {showExportMenu && (
                        <div className="absolute top-full mt-1 right-0 glass-strong rounded-lg z-20 min-w-[100px] py-1">
                            <button
                                onClick={() => handleExportClick('csv')}
                                className="w-full text-left px-3 py-2 hover:bg-slate-700 text-sm"
                            >
                                CSV
                            </button>
                            <button
                                onClick={() => handleExportClick('json')}
                                className="w-full text-left px-3 py-2 hover:bg-slate-700 text-sm"
                            >
                                JSON
                            </button>
                        </div>
                    )}
                </div>

                {/* Refresh */}
                <button
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                    className="btn-icon"
                    title="Refresh"
                >
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                </button>

                {/* Clear All */}
                {hasActiveFilters && (
                    <button
                        onClick={handleClearAll}
                        className="btn-secondary text-sm text-red-400"
                        title="Clear all filters"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
};

export default React.memo(ControlPanel);
