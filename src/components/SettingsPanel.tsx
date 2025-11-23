"use client";

import { useState, useEffect } from "react";
import { useLicenses } from "@/hooks/useLicenses";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { Settings, Cloud, HardDrive, Sun, Moon, Monitor, Trash2, Info, ExternalLink, Globe, FolderOpen, Download } from "lucide-react";

export function SettingsPanel() {
    const { licenses } = useLicenses();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [storageInfo, setStorageInfo] = useState<{
        currentPath: string;
        iCloudAvailable: boolean;
        useICloud: boolean;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

    const checkForUpdates = async () => {
        setIsCheckingUpdate(true);
        try {
            console.log('Checking for updates from GitHub API...');

            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }

            const result = await window.electronAPI.checkForUpdates();
            console.log('Update check result:', result);

            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to fetch update information');
            }

            const latestVersion = result.data.tagName.replace('v', '');
            const currentVersion = '1.3.0';

            console.log('Latest version:', latestVersion);
            console.log('Current version:', currentVersion);

            if (latestVersion > currentVersion) {
                if (confirm(`${t('newVersionAvailable')}: ${latestVersion}\n${t('downloadNow')}`)) {
                    window.electronAPI.openExternal(result.data.htmlUrl);
                }
            } else {
                alert(t('upToDate'));
            }
        } catch (error) {
            console.error('Update check failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`${t('updateCheckFailed')}\n\n${errorMessage}`);
        } finally {
            setIsCheckingUpdate(false);
        }
    };

    useEffect(() => {
        loadStorageInfo();
    }, []);

    const loadStorageInfo = async () => {
        if (window.electronAPI) {
            const info = await window.electronAPI.getStorageLocation();
            setStorageInfo(info);
        }
        setIsLoading(false);
    };

    const handleStorageChange = async (useICloud: boolean) => {
        if (!window.electronAPI) return;

        const confirmMsg = t('storageChangeDesc');

        if (!confirm(confirmMsg)) return;

        const result = await window.electronAPI.setStorageLocation(useICloud);
        if (result.success) {
            alert(`${t('storageChangeTitle')}:\n${result.path}\n\n${t('loading')}`);
            loadStorageInfo();
        } else {
            alert(`Error: ${result.error}`);
        }
    };

    const handleDataReset = async () => {
        const confirm1 = window.confirm(
            `⚠️ ${t('resetConfirmTitle')}\n\n${t('resetConfirmDesc')}`
        );
        if (!confirm1) return;

        // Delete all data by saving empty array
        if (window.electronAPI) {
            await window.electronAPI.saveLicenses([]);
            alert(t('resetConfirmDesc'));
            window.location.reload();
        }
    };

    const openBlog = () => {
        if (window.electronAPI) {
            window.electronAPI.openExternal("https://hjm79.top");
        }
    };

    const themeOptions = [
        { value: "light" as const, icon: Sun, label: t('light') },
        { value: "dark" as const, icon: Moon, label: t('dark') },
        { value: "system" as const, icon: Monitor, label: t('system') },
    ];

    const languageOptions = [
        { value: "ko" as const, label: t('korean') },
        { value: "en" as const, label: t('english') },
    ];

    return (
        <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900">
            <div className="mx-auto max-w-4xl">
                <div className="px-8 py-6">

                    <div className="space-y-6">
                        {/* Language Settings */}
                        <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                {t('language')}
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                {languageOptions.map((option) => {
                                    const isActive = language === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => setLanguage(option.value)}
                                            className={`p-4 rounded-lg border-2 transition-all ${isActive
                                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                                : "border-slate-300 dark:border-slate-600 hover:border-indigo-400"
                                                }`}
                                        >
                                            <div className="font-semibold text-slate-900 dark:text-white text-center">
                                                {option.label}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Storage Location */}
                        <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Cloud className="h-5 w-5" />
                                {t('storageLocation')}
                            </h2>

                            {isLoading ? (
                                <p className="text-slate-500">{t('loading')}</p>
                            ) : (
                                <>
                                    <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{t('currentLocation')}</p>
                                            <button
                                                onClick={() => {
                                                    if (window.electronAPI && storageInfo?.currentPath) {
                                                        window.electronAPI.showItemInFolder(storageInfo.currentPath);
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all hover:scale-105"
                                            >
                                                <FolderOpen className="h-4 w-4" />
                                                Finder
                                            </button>
                                        </div>
                                        <p className="font-mono text-sm text-slate-900 dark:text-white break-all">
                                            {storageInfo?.currentPath}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleStorageChange(true)}
                                            disabled={!storageInfo?.iCloudAvailable || storageInfo?.useICloud}
                                            className={`p-4 rounded-lg border-2 transition-all ${storageInfo?.useICloud
                                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                                : "border-slate-300 dark:border-slate-600 hover:border-indigo-400"
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <Cloud className="h-6 w-6 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                                            <div className="font-semibold text-slate-900 dark:text-white">{t('iCloudDrive')}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {storageInfo?.iCloudAvailable ? t('iCloudDesc') : "N/A"}
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleStorageChange(false)}
                                            disabled={!storageInfo?.useICloud}
                                            className={`p-4 rounded-lg border-2 transition-all ${!storageInfo?.useICloud
                                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                                : "border-slate-300 dark:border-slate-600 hover:border-indigo-400"
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <HardDrive className="h-6 w-6 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                                            <div className="font-semibold text-slate-900 dark:text-white">{t('local')}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {t('localDesc')}
                                            </div>
                                        </button>
                                    </div>

                                    <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
                                        {t('storageWarning')}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Theme Settings */}
                        <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Sun className="h-5 w-5" />
                                {t('themeSettings')}
                            </h2>

                            <div className="grid grid-cols-3 gap-4">
                                {themeOptions.map((option) => {
                                    const Icon = option.icon;
                                    const isActive = theme === option.value;

                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => setTheme(option.value)}
                                            className={`p-4 rounded-lg border-2 transition-all ${isActive
                                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                                : "border-slate-300 dark:border-slate-600 hover:border-indigo-400"
                                                }`}
                                        >
                                            <Icon className="h-6 w-6 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                                            <div className="font-semibold text-slate-900 dark:text-white">
                                                {option.label}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Data Management */}
                        <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Trash2 className="h-5 w-5" />
                                {t('dataManagement')}
                            </h2>

                            <div className="space-y-4">
                                <p className="text-slate-600 dark:text-slate-400">
                                    {t('dataResetDesc')}
                                </p>

                                <button
                                    onClick={handleDataReset}
                                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
                                >
                                    <Trash2 className="h-5 w-5" />
                                    {t('deleteAllData')}
                                </button>
                            </div>
                        </div>

                        {/* App Info */}
                        <div className="rounded-lg bg-white dark:bg-slate-800 p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                {t('appInfo')}
                            </h2>

                            {/* Logo */}
                            <div className="flex justify-center mb-6">
                                <img
                                    src="./logo.png"
                                    alt="HJM Logo"
                                    className="w-32 h-auto"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-600 dark:text-slate-400">{t('appName')}</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">KeyVault</span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-600 dark:text-slate-400">{t('version')}</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">1.3.0</span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-600 dark:text-slate-400">{t('developer')}</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">마니의블로그</span>
                                </div>

                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-600 dark:text-slate-400">{t('blog')}</span>
                                    <button
                                        onClick={openBlog}
                                        className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                    >
                                        https://hjm79.top
                                        <ExternalLink className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Update Check Button */}
                            <button
                                onClick={checkForUpdates}
                                disabled={isCheckingUpdate}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium shadow-sm"
                            >
                                {isCheckingUpdate ? (
                                    <>
                                        <span className="animate-spin">⟳</span>
                                        {t('checking')}
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-5 w-5" />
                                        {t('checkForUpdates')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
