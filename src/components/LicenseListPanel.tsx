import { License } from "@/types";
import { Search, Tag, User } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

interface LicenseListPanelProps {
    licenses: License[];
    selectedLicenseId?: string;
    onSelectLicense: (license: License) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function LicenseListPanel({
    licenses,
    selectedLicenseId,
    onSelectLicense,
    searchQuery,
    onSearchChange,
}: LicenseListPanelProps) {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 w-full shrink-0">
            <div
                className="p-4 pt-8 border-b border-slate-200 dark:border-slate-700"
                style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
            >
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-800 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-white"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {licenses.map((license) => (
                        <li
                            key={license.id}
                            onClick={() => onSelectLicense(license)}
                            className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedLicenseId === license.id ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                                }`}
                        >
                            <div className="p-4 flex items-start space-x-3">
                                <div className="shrink-0">
                                    {license.icon ? (
                                        <img
                                            src={license.icon}
                                            alt={license.name}
                                            className="h-10 w-10 rounded-lg object-contain bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-lg border border-indigo-200 dark:border-indigo-800">
                                            {license.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm font-medium truncate ${selectedLicenseId === license.id
                                            ? "text-indigo-600 dark:text-indigo-400"
                                            : "text-slate-900 dark:text-white"
                                            }`}>
                                            {license.name}
                                        </p>
                                        {/* Optional: Date or other meta info could go here */}
                                    </div>
                                    {license.owner && (
                                        <div className="mt-1 flex items-center text-xs text-slate-500 dark:text-slate-400">
                                            <User className="shrink-0 mr-1 h-3 w-3" />
                                            <span className="truncate">{license.owner}</span>
                                        </div>
                                    )}
                                    {license.tags && license.tags.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {license.tags.slice(0, 3).map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {license.tags.length > 3 && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                                    +{license.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                    {licenses.length === 0 && (
                        <li className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                            {searchQuery ? t('noSearchResults') : t('noLicenses')}
                            <br />
                            <span className="text-xs mt-1 block">
                                {searchQuery ? t('noSearchResultsDesc') : t('noLicensesDesc')}
                            </span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
