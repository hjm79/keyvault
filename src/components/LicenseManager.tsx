"use client";

import { useState, useMemo, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { LicenseListPanel } from "@/components/LicenseListPanel";
import { LicenseDetailPanel } from "@/components/LicenseDetailPanel";
import { LicenseForm } from "@/components/LicenseForm";
import { SettingsPanel } from "@/components/SettingsPanel";
import { LoginScreen } from "@/components/LoginScreen";
import { Modal } from "@/components/Modal";
import { useLicenses } from "@/hooks/useLicenses";
import { License, SortOption } from "@/types";
import { useLanguage } from "@/components/LanguageProvider";

type ViewState = 'list' | 'create' | 'edit' | 'settings';

export function LicenseManager() {
    const { licenses, loading, deleteLicense } = useLicenses();
    const { t } = useLanguage();
    const [view, setView] = useState<ViewState>('list');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>(null);
    const [editLicenseId, setEditLicenseId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAddLicenseOpen, setIsAddLicenseOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>('default');

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

    // Auto-lock after 5 minutes of inactivity
    useEffect(() => {
        if (!isAuthenticated) return;

        let timeoutId: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsAuthenticated(false);
            }, 300000); // 5 minutes = 300,000 ms
        };

        // Activity events to track
        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Start initial timer
        resetTimer();

        // Cleanup on unmount or when authentication changes
        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [isAuthenticated]);

    // Check for expiring licenses
    useEffect(() => {
        if (!isAuthenticated || !licenses) return;

        const checkExpiry = () => {
            const now = new Date();
            const warningDate = new Date();
            warningDate.setDate(now.getDate() + 7); // 7 days warning

            licenses.forEach(license => {
                if (license.expiryDate) {
                    const expiry = new Date(license.expiryDate);
                    if (isNaN(expiry.getTime())) return;

                    // Check if expiring within 7 days and is in the future
                    if (expiry > now && expiry <= warningDate) {
                        const notificationKey = `notified-${license.id}-${expiry.toISOString().split('T')[0]}`;
                        if (!sessionStorage.getItem(notificationKey)) {
                            new Notification(t('licenseExpiringSoon'), {
                                body: `${license.name} - ${license.expiryDate}`,
                            });
                            sessionStorage.setItem(notificationKey, 'true');
                        }
                    }
                }
            });
        };

        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    checkExpiry();
                }
            });
        } else {
            checkExpiry();
        }
    }, [isAuthenticated, licenses, t]);

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

    // Sort licenses
    const sortedLicenses = useMemo(() => {
        const result = [...filteredLicenses];

        switch (sortOption) {
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'added-desc':
                result.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
                break;
            case 'added-asc':
                result.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
                break;
            case 'modified-desc':
                result.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
                break;
            case 'modified-asc':
                result.sort((a, b) => (a.updatedAt || '').localeCompare(b.updatedAt || ''));
                break;
            case 'default':
            default:
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        return result;
    }, [filteredLicenses, sortOption]);

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
        if (newView === 'settings') {
            setIsSettingsOpen(true);
            return;
        }
        if (newView === 'create') {
            setIsAddLicenseOpen(true);
            return;
        }

        setView(newView);
        if (newView === 'list') {
            // Don't clear selection if we are just closing a modal, 
            // but if we are explicitly navigating to list, maybe we should?
            // For now, let's keep selection state unless explicitly cleared
        }
    };

    // Render content based on view state
    const renderContent = () => {
        switch (view) {
            case 'create':
                return (
                    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-800">
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
                    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-800">
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
                                    licenses={sortedLicenses}
                                    selectedLicenseId={selectedLicenseId || undefined}
                                    onSelectLicense={handleSelectLicense}
                                    sortOption={sortOption}
                                    onSortChange={setSortOption}
                                />
                            </div>
                            <div className={`${selectedLicenseId ? 'w-full md:w-1/2 lg:w-3/5' : 'hidden md:block md:w-1/2 lg:w-3/5'} bg-slate-50 dark:bg-zinc-800`}>
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

            <Modal
                isOpen={isAddLicenseOpen}
                onClose={() => setIsAddLicenseOpen(false)}
                title={t('addLicense')}
            >
                <LicenseForm
                    onSuccess={() => setIsAddLicenseOpen(false)}
                    onCancel={() => setIsAddLicenseOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                title={t('settings')}
            >
                <SettingsPanel />
            </Modal>
        </div>
    );
}
