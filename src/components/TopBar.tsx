"use client";

import { Plus, Search } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

interface TopBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddLicense: () => void;
}

export function TopBar({ searchQuery, onSearchChange, onAddLicense }: TopBarProps) {
    const { t } = useLanguage();

    return (
        <div
            className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
            <div className="flex items-center gap-4">
                {/* Search Input */}
                <div className="flex-1 relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-800 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-white transition-all"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    />
                </div>

                {/* Add License Button */}
                <button
                    onClick={onAddLicense}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    <Plus className="h-5 w-5" />
                    <span className="hidden sm:inline">{t('addLicense')}</span>
                </button>
            </div>
        </div>
    );
}
