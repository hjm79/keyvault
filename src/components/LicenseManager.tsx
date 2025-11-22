"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { LicenseListPanel } from "@/components/LicenseListPanel";
import { LicenseDetailPanel } from "@/components/LicenseDetailPanel";
import { LicenseForm } from "@/components/LicenseForm";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useLicenses } from "@/hooks/useLicenses";
import { License } from "@/types";

type ViewState = 'list' | 'create' | 'edit' | 'settings';

export function LicenseManager() {
    const { licenses, loading, deleteLicense } = useLicenses();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>(null);
    const [view, setView] = useState<ViewState>('list');
    const [editLicenseId, setEditLicenseId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter licenses based on category and search query
    const filteredLicenses = useMemo(() => {
        let result = licenses;
        if (selectedCategory) {
            result = result.filter((license) => license.category === selectedCategory);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((license) =>
                license.name.toLowerCase().includes(query) ||
                license.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }
        return result;
    }, [licenses, selectedCategory, searchQuery]);

    const selectedLicense = useMemo(() => {
        return licenses.find((l) => l.id === selectedLicenseId) || null;
    }, [licenses, selectedLicenseId]);

    const editLicense = useMemo(() => {
        return licenses.find((l) => l.id === editLicenseId);
    }, [licenses, editLicenseId]);

    const handleNavigate = (newView: ViewState) => {
        setView(newView);
        if (newView === 'list') {
            setEditLicenseId(null);
        }
    };

    const handleSelectLicense = (license: License) => {
        setSelectedLicenseId(license.id);
    };

    const handleEdit = (license: License) => {
        setEditLicenseId(license.id);
        setView('edit');
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this license?")) {
            await deleteLicense(id);
            if (selectedLicenseId === id) {
                setSelectedLicenseId(null);
            }
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                        <p className="mt-2 text-slate-500">Loading licenses...</p>
                    </div>
                </div>
            );
        }

        switch (view) {
            case 'create':
                return (
                    <div className="p-8 max-w-3xl mx-auto h-full overflow-y-auto">
                        <LicenseForm
                            onSuccess={() => handleNavigate('list')}
                            onCancel={() => handleNavigate('list')}
                        />
                    </div>
                );
            case 'edit':
                return (
                    <div className="p-8 max-w-3xl mx-auto h-full overflow-y-auto">
                        <LicenseForm
                            initialData={editLicense}
                            isEdit
                            onSuccess={() => handleNavigate('list')}
                            onCancel={() => handleNavigate('list')}
                        />
                    </div>
                );
            case 'settings':
                return <SettingsPanel />;
            case 'list':
            default:
                return (
                    <div className="flex h-full">
                        <div className={`${selectedLicense ? 'hidden md:block md:w-1/2 lg:w-2/5' : 'w-full md:w-1/2 lg:w-2/5'} border-r border-slate-200 dark:border-slate-700`}>
                            <LicenseListPanel
                                licenses={filteredLicenses}
                                selectedLicenseId={selectedLicenseId || undefined}
                                onSelectLicense={handleSelectLicense}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                            />
                        </div>
                        {selectedLicense ? (
                            <div className="flex-1 h-full overflow-hidden">
                                <LicenseDetailPanel
                                    license={selectedLicense}
                                    onClose={() => setSelectedLicenseId(null)}
                                    onEdit={() => handleEdit(selectedLicense)}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ) : (
                            <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400">
                                <p>Select a license to view details</p>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-900">
            <Sidebar
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                licenses={licenses}
                onNavigate={handleNavigate}
            />
            <main className="flex-1 overflow-hidden relative">
                {renderContent()}
            </main>
        </div>
    );
}
