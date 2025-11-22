"use client";

import { useState, useMemo, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { LicenseListPanel } from "@/components/LicenseListPanel";
import { LicenseDetailPanel } from "@/components/LicenseDetailPanel";
import { LicenseForm } from "@/components/LicenseForm";
import { SettingsPanel } from "@/components/SettingsPanel";
import { LoginScreen } from "@/components/LoginScreen";
import { useLicenses } from "@/hooks/useLicenses";
import { License } from "@/types";

type ViewState = 'list' | 'create' | 'edit' | 'settings';

export function LicenseManager() {
    const { licenses, loading, deleteLicense } = useLicenses();
    const [view, setView] = useState<ViewState>('list');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>(null);
    const [editLicenseId, setEditLicenseId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if password exists (if not, show setup)
    useEffect(() => {
        const storedHash = localStorage.getItem("app_password_hash");
        if (!storedHash) {
            // No password set yet, show setup screen (handled by LoginScreen logic)
            setIsAuthenticated(false);
        } else {
            setIsAuthenticated(false); // Still needs to authenticate
        }
    }, []);

    // Filter licenses based on category and search query
    const filteredLicenses = useMemo(() => {
        let result = licenses || [];

        if (selectedCategory) {
            result = result.filter((l) => l.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((license) =>
                license.name.toLowerCase().includes(query) ||
                license.licenseKey?.toLowerCase().includes(query) ||
                license.memo?.toLowerCase().includes(query) ||
                license.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        return result;
    }, [licenses, selectedCategory, searchQuery]);

    if (!isAuthenticated) {
        return <LoginScreen onAuthenticated={() => setIsAuthenticated(true)} />;
    }

    const handleSelectLicense = (id: string) => {
        setSelectedLicenseId(id);
        setView('list'); // Ensure we stay in list view but show detail
    };

    const handleEditLicense = (id: string) => {
        setEditLicenseId(id);
        setView('edit');
    };

    const handleDeleteLicense = async (id: string) => {
        if (confirm("Are you sure you want to delete this license?")) {
            await deleteLicense(id);
            if (selectedLicenseId === id) {
                setSelectedLicenseId(null);
            }
        }
    };

    const handleNavigate = (newView: ViewState) => {
        setView(newView);
        if (newView === 'create') {
            setSelectedLicenseId(null);
            setEditLicenseId(null);
        }
    };

    // Render content based on view state
    const renderContent = () => {
        switch (view) {
            case 'create':
                return (
                    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
                        <div
                            className="h-12 shrink-0"
                            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
                        />
                        <div className="flex-1 flex justify-center overflow-y-auto p-6">
                            <div className="w-full max-w-3xl">
                                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <div
                                        className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between"
                                    >
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add New License</h2>
                                        <button
                                            onClick={() => handleNavigate('list')}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <LicenseForm
                                        onSuccess={() => handleNavigate('list')}
                                        onCancel={() => handleNavigate('list')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'edit':
                return (
                    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
                        <div
                            className="h-12 shrink-0"
                            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
                        />
                        <div className="flex-1 flex justify-center overflow-y-auto p-6">
                            <div className="w-full max-w-3xl">
                                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <div
                                        className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between"
                                    >
                                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit License</h2>
                                        <button
                                            onClick={() => handleNavigate('list')}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <LicenseForm
                                        licenseId={editLicenseId || undefined}
                                        onSuccess={() => handleNavigate('list')}
                                        onCancel={() => handleNavigate('list')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'settings':
                return <SettingsPanel />;
            case 'list':
            default:
                return (
                    <div className="flex flex-col h-full">
                        <TopBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onAddLicense={() => handleNavigate('create')}
                        />
                        <div className="flex flex-1 overflow-hidden">
                            <div className={`${selectedLicenseId ? 'hidden md:block md:w-1/2 lg:w-2/5' : 'w-full md:w-1/2 lg:w-2/5'} border-r border-slate-200 dark:border-slate-700`}>
                                <LicenseListPanel
                                    licenses={filteredLicenses}
                                    selectedLicenseId={selectedLicenseId || undefined}
                                    onSelectLicense={handleSelectLicense}
                                />
                            </div>
                            <div className={`${selectedLicenseId ? 'w-full md:w-1/2 lg:w-3/5' : 'hidden md:block md:w-1/2 lg:w-3/5'} bg-slate-50 dark:bg-slate-900`}>
                                <LicenseDetailPanel
                                    licenseId={selectedLicenseId || undefined}
                                    onEdit={handleEditLicense}
                                    onDelete={handleDeleteLicense}
                                    onClose={() => setSelectedLicenseId(null)}
                                />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden">
            <Sidebar
                currentView={view}
                onNavigate={handleNavigate}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {renderContent()}
            </main>
        </div>
    );
}
