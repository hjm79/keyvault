"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutGrid,
    Plus,
    Settings,
    Key,
    Download,
    Upload,
    Tag,
    Sun,
    Moon,
    Monitor,
    Edit2,
    FileSpreadsheet
} from "lucide-react";
import { Category } from "@/types";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "./LanguageProvider";
import { useLicenses } from "./LicensesProvider";
import { cn } from "@/lib/utils";
import { CategoryModal } from "./CategoryModal";

interface SidebarProps {
    currentView: 'list' | 'create' | 'edit' | 'settings';
    onNavigate: (view: 'list' | 'create' | 'edit' | 'settings') => void;
    selectedCategory: string | null;
    onSelectCategory: (category: string | null) => void;
}

export function Sidebar({ currentView, onNavigate, selectedCategory, onSelectCategory }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { t } = useLanguage();
    const { categories, addCategory, updateCategory, deleteCategory, licenses } = useLicenses();
    const [isProcessing, setIsProcessing] = useState(false);

    // Category Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create');
    const [editingCategory, setEditingCategory] = useState<string>("");

    const themeOptions = [
        { value: "light" as const, icon: Sun, label: t('light') },
        { value: "dark" as const, icon: Moon, label: t('dark') },
        { value: "system" as const, icon: Monitor, label: t('system') },
    ];

    const currentThemeOption = themeOptions.find(opt => opt.value === theme) || themeOptions[2];

    const cycleTheme = () => {
        const currentIndex = themeOptions.findIndex(opt => opt.value === theme);
        const nextIndex = (currentIndex + 1) % themeOptions.length;
        setTheme(themeOptions[nextIndex].value);
    };

    // Calculate counts for each category
    const categoryCounts = (categories || []).reduce((acc, category) => {
        acc[category] = (licenses || []).filter(l => l.category === category).length;
        return acc;
    }, {} as Record<string, number>);

    // Export/Import handlers
    const handleExport = async () => {
        if (!window.electronAPI || isProcessing) return;
        setIsProcessing(true);
        try {
            const result = await window.electronAPI.exportLicensesZIP();
            if (result.success) {
                alert(`${t('exportSuccess')}: ${result.count}\n${result.path}`);
            } else if (!result.canceled) {
                alert(`Export failed: ${result.error}`);
            }
        } catch (error) {
            alert(`Export failed: ${error}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImport = async () => {
        if (!window.electronAPI || isProcessing) return;
        setIsProcessing(true);
        try {
            const result = await window.electronAPI.importLicenses();
            if (result.success) {
                const msg = t('importResult', {
                    imported: result.imported || 0,
                    skipped: result.skipped || 0,
                    total: result.total || 0
                });
                alert(`${t('importSuccess')}\n\n${msg}`);
                // Refresh the page to load new data
                window.location.reload();
            } else if (!result.canceled) {
                alert(`Import failed: ${result.error}`);
            }
        } catch (error) {
            alert(`Import failed: ${error}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddCategory = () => {
        setCategoryModalMode('create');
        setEditingCategory("");
        setIsCategoryModalOpen(true);
    };

    const handleEditCategory = (category: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCategoryModalMode('edit');
        setEditingCategory(category);
        setIsCategoryModalOpen(true);
    };

    const handleSaveCategory = async (name: string) => {
        if (categoryModalMode === 'create') {
            await addCategory(name);
        } else {
            await updateCategory(editingCategory, name);
        }
        setIsCategoryModalOpen(false);
    };

    const handleDeleteCategory = async () => {
        await deleteCategory(editingCategory);
        if (selectedCategory === editingCategory) {
            onSelectCategory(null);
        }
        setIsCategoryModalOpen(false);
    };

    return (
        <div className="flex h-full w-64 flex-col bg-stone-50 dark:bg-zinc-900 text-slate-900 dark:text-white shrink-0 border-r border-stone-200 dark:border-zinc-800 select-none">
            {/* Draggable titlebar region for macOS window dragging */}
            <div
                className="flex items-center px-4 pt-8 pb-4 border-b border-stone-200 dark:border-zinc-800"
                style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
            >
                <img
                    src="./icon.png"
                    alt="KeyVault"
                    className="h-8 w-8 object-contain rounded-lg"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                />
                <span className="ml-3 text-lg font-semibold">KeyVault</span>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {/* Main Navigation */}
                <div className="space-y-1">
                    <button
                        onClick={() => {
                            onSelectCategory(null);
                            onNavigate('list');
                        }}
                        className={cn(
                            "group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            selectedCategory === null
                                ? "bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-white"
                                : "text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white"
                        )}
                    >
                        <Key className="mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-[1.15]" />
                        <span className="flex-1">{t('allKeys')}</span>
                        {licenses.length > 0 && (
                            <span className={cn(
                                "ml-auto py-0.5 px-2 rounded-full text-xs font-medium",
                                selectedCategory === null
                                    ? "bg-stone-300 dark:bg-zinc-700 text-stone-900 dark:text-white"
                                    : "bg-stone-200 dark:bg-zinc-800 group-hover:bg-stone-300 dark:group-hover:bg-zinc-700 text-stone-900 dark:text-white"
                            )}>
                                {licenses.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Export/Import */}
                <div className="space-y-1">
                    <button
                        onClick={handleImport}
                        disabled={isProcessing}
                        className="group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Upload className="mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-[1.15]" />
                        {t('import')}
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isProcessing}
                        className="group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-[1.15]" />
                        {t('export')}
                    </button>
                    <button
                        onClick={async () => {
                            if (!window.electronAPI || isProcessing) return;
                            setIsProcessing(true);
                            try {
                                const result = await window.electronAPI.exportLicensesExcel();
                                if (result.success) {
                                    alert(`${t('exportExcelSuccess')}: ${result.count}\n${result.path}`);
                                } else if (!result.canceled) {
                                    alert(`Export failed: ${result.error}`);
                                }
                            } catch (error) {
                                alert(`Export failed: ${error}`);
                            } finally {
                                setIsProcessing(false);
                            }
                        }}
                        disabled={isProcessing}
                        className="group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileSpreadsheet className="mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-[1.15]" />
                        {t('exportExcel')}
                    </button>
                </div>

                {/* Categories */}
                <div>
                    <div className="px-3 mb-2 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                        <span>{t('categories')}</span>
                        <button onClick={handleAddCategory} title={t('addCategory')}>
                            <Plus className="h-4 w-4 cursor-pointer hover:text-stone-900 dark:hover:text-white" />
                        </button>
                    </div>
                    <div className="space-y-1">
                        {categories.map((category) => {
                            const count = categoryCounts[category] || 0;
                            return (
                                <div
                                    key={category}
                                    className={cn(
                                        "group w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                                        selectedCategory === category
                                            ? "bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-white"
                                            : "text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white"
                                    )}
                                    onClick={() => {
                                        onSelectCategory(category);
                                        onNavigate('list');
                                    }}
                                >
                                    <div className="flex items-center flex-1 min-w-0">
                                        <Tag className="mr-3 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-[1.15]" />
                                        <span className="truncate">{category}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-full",
                                            selectedCategory === category ? "bg-stone-300 dark:bg-zinc-700 text-stone-900 dark:text-white" : "bg-stone-200 dark:bg-zinc-800 group-hover:bg-stone-300 dark:group-hover:bg-zinc-700 text-stone-900 dark:text-white"
                                        )}>
                                            {count}
                                        </span>
                                        <button
                                            onClick={(e) => handleEditCategory(category, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-stone-900 dark:hover:text-white transition-opacity"
                                            title={t('editCategory')}
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer / Settings */}
            <div className="p-4 border-t border-stone-200 dark:border-zinc-800 space-y-3">
                <button
                    onClick={() => onNavigate('settings')}
                    className={cn(
                        "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        pathname === "/settings"
                            ? "text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white"
                            : "text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white"
                    )}
                >
                    <Settings className="mr-3 h-5 w-5" />
                    {t('settings')}
                </button>

                {/* Theme Switcher */}
                <button
                    onClick={cycleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-stone-100 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all duration-200 shadow-sm text-stone-700 dark:text-zinc-300"
                    title={t('theme')}
                >
                    <div className="flex items-center">
                        <currentThemeOption.icon className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                        <span className="text-sm">{currentThemeOption.label}</span>
                    </div>
                </button>
            </div>

            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSave={handleSaveCategory}
                initialValue={editingCategory}
                mode={categoryModalMode}
                onDelete={handleDeleteCategory}
            />
        </div>
    );
}
