import { License } from "@/types";
import {
    Calendar,
    CreditCard,
    ExternalLink,
    FileText,
    FolderOpen,
    Globe,
    Tag,
    User,
    Edit,
    Trash2,
    X,
    Terminal
} from "lucide-react";

import { useLicenses } from "@/hooks/useLicenses";

interface LicenseDetailPanelProps {
    licenseId?: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onClose?: () => void;
}

import { useLanguage } from "./LanguageProvider";
import { useState } from "react";

// ... inside component
export function LicenseDetailPanel({ licenseId, onEdit, onDelete, onClose }: LicenseDetailPanelProps) {
    const { licenses } = useLicenses();
    const license = licenseId ? (licenses || []).find(l => l.id === licenseId) || null : null;
    const { t } = useLanguage();
    const [isExecuting, setIsExecuting] = useState(false);

    const handleExecuteCommand = async () => {
        if (!license?.brewCaskCommand || isExecuting) return;

        const confirmed = confirm(`${t('confirmExecuteCommand')}\n\n${license.brewCaskCommand}`);
        if (!confirmed) return;

        setIsExecuting(true);
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.executeTerminalCommand(license.brewCaskCommand);
                if (result.success) {
                    alert(t('commandExecuted'));
                } else {
                    alert(`${t('commandFailed')}: ${result.error}`);
                }
            }
        } catch (error) {
            alert(`${t('commandFailed')}: ${error}`);
        } finally {
            setIsExecuting(false);
        }
    };

    if (!license) {
        return (
            <div
                className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
            >
                <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-4" />
                    <p className="text-lg font-medium">Select a license to view details</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto">
            {/* Header */}
            <div
                className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-8 pt-12"
                style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
            >
                <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-6">
                        <div className="shrink-0">
                            {license.icon ? (
                                <img
                                    src={license.icon}
                                    alt={license.name}
                                    className="h-24 w-24 rounded-2xl object-contain bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-2xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-4xl border border-indigo-200 dark:border-indigo-800 shadow-sm">
                                    {license.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{license.name}</h1>
                            {license.version && (
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('version')}: {license.version}</p>
                            )}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                    {license.category}
                                </span>
                                {license.tags && license.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                    >
                                        <Tag className="w-3 h-3 mr-1" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div
                        className="flex space-x-3"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                        <button
                            onClick={() => onEdit(license.id)}
                            className="inline-flex items-center px-2 py-1 border border-slate-300 dark:border-slate-600 shadow-sm text-xs font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap flex-shrink-0"
                        >
                            <Edit className="h-3 w-3 mr-1 flex-shrink-0" />
                            {t('edit')}
                        </button>
                        <button
                            onClick={() => {
                                if (confirm(t('deleteConfirmDesc'))) {
                                    onDelete(license.id);
                                }
                            }}
                            className="inline-flex items-center px-2 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 whitespace-nowrap flex-shrink-0"
                        >
                            <Trash2 className="h-3 w-3 mr-1 flex-shrink-0" />
                            {t('delete')}
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="md:hidden inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="p-5 max-w-4xl">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">License Details</h2>

                <div className="grid grid-cols-1 gap-y-4">
                    {/* Owner */}
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('owner')}</dt>
                        <dd className="text-sm text-slate-900 dark:text-white flex items-center">
                            {license.owner ? (
                                <>
                                    <User className="h-4 w-4 mr-1.5 text-slate-400" />
                                    {license.owner}
                                </>
                            ) : (
                                <span className="text-slate-400 italic text-xs">Not specified</span>
                            )}
                        </dd>
                    </div>

                    {/* Website */}
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('website')}</dt>
                        <dd className="text-sm text-slate-900 dark:text-white flex items-center">
                            {license.url ? (
                                <a
                                    href={license.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center truncate"
                                >
                                    <Globe className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                    <span className="truncate">{license.url}</span>
                                </a>
                            ) : (
                                <span className="text-slate-400 italic text-xs">Not specified</span>
                            )}
                        </dd>
                    </div>

                    {/* License Key */}
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('licenseKey')}</dt>
                        <dd className="mt-1 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-xs text-slate-900 dark:text-white break-all whitespace-pre-wrap border border-slate-200 dark:border-slate-700">
                            {license.licenseKey || <span className="text-slate-400 italic">No license key</span>}
                        </dd>
                    </div>

                    {/* License File */}
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('files')}</dt>
                        <dd className="mt-1">
                            {license.licenseFile ? (
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span className="text-xs text-slate-900 dark:text-white font-mono truncate">
                                        {license.licenseFile.split('/').pop()}
                                    </span>
                                    <button
                                        onClick={() => window.electronAPI?.openPath(license.licenseFile!)}
                                        className="inline-flex items-center px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 shadow-sm text-xs font-medium rounded text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                                        title={t('openFile')}
                                    >
                                        <ExternalLink className="h-3 w-3 mr-0.5" />
                                        {t('open')}
                                    </button>
                                    <button
                                        onClick={() => window.electronAPI?.showItemInFolder(license.licenseFile!)}
                                        className="inline-flex items-center px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 shadow-sm text-xs font-medium rounded text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                                        title={t('showInFolder')}
                                    >
                                        <FolderOpen className="h-3 w-3 mr-0.5" />
                                        {t('folder')}
                                    </button>
                                </div>
                            ) : (
                                <span className="text-slate-400 italic text-xs">No file attached</span>
                            )}
                        </dd>
                    </div>

                    {/* Dates & Price */}
                    <div className="grid grid-cols-3 gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                        <div>
                            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">{t('purchaseDate')}</dt>
                            <dd className="text-xs text-slate-900 dark:text-white flex items-center">
                                <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                                {license.purchaseDate || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">{t('expiryDate')}</dt>
                            <dd className="text-xs text-slate-900 dark:text-white flex items-center">
                                <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                                {license.expiryDate || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">{t('price')}</dt>
                            <dd className="text-xs text-slate-900 dark:text-white flex items-center">
                                <CreditCard className="h-3 w-3 mr-1 text-slate-400" />
                                {license.price || "-"}
                            </dd>
                        </div>
                    </div>

                    {/* Brew Cask Command */}
                    {license.brewCaskCommand && (
                        <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center">
                                <Terminal className="h-3 w-3 mr-1.5" />
                                {t('brewCaskCommand')}
                            </dt>
                            <dd className="flex items-center gap-2">
                                <code className="flex-1 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono truncate">
                                    {license.brewCaskCommand}
                                </code>
                                <button
                                    onClick={handleExecuteCommand}
                                    disabled={isExecuting}
                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                                >
                                    <Terminal className="h-3 w-3 mr-1" />
                                    {isExecuting ? t('loading') : t('executeCommand')}
                                </button>
                            </dd>
                        </div>
                    )}

                    {/* Memo */}
                    <div>
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('notes')}</dt>
                        <dd className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                            {license.memo || <span className="text-slate-400 italic text-xs">No memo</span>}
                        </dd>
                    </div>
                </div>
            </div>
        </div>
    );
}
