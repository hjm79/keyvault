import { License } from "@/types";
import { User } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

interface LicenseListPanelProps {
    licenses: License[];
    selectedLicenseId?: string;
    onSelectLicense: (id: string) => void;
}

export function LicenseListPanel({
    licenses,
    selectedLicenseId,
    onSelectLicense,
}: LicenseListPanelProps) {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 w-full shrink-0 select-none">
            <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                    {(licenses || []).map((license) => (
                        <li
                            key={license.id}
                            onClick={() => onSelectLicense(license.id)}
                            className={`group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedLicenseId === license.id ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                                }`}
                        >
                            <div className="p-4 flex items-start space-x-3">
                                <div className="shrink-0">
                                    {license.icon ? (
                                        <img
                                            src={license.icon}
                                            alt={license.name}
                                            className="h-10 w-10 rounded-lg object-contain bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 transition-transform duration-200 group-hover:scale-[1.15]"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-lg border border-indigo-200 dark:border-indigo-800 transition-transform duration-200 group-hover:scale-[1.15]">
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
                            {t('noLicenses')}
                            <br />
                            <span className="text-xs mt-1 block">
                                {t('noLicensesDesc')}
                            </span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
