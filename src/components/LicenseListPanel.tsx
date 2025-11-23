import { License, SortOption } from "@/types";
import { User, ListFilter, Check, ArrowDownAZ, ArrowUpAZ, Calendar, Clock } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { useState, useRef, useEffect } from "react";

interface LicenseListPanelProps {
    licenses: License[];
    selectedLicenseId?: string;
    onSelectLicense: (id: string) => void;
    sortOption: SortOption;
    onSortChange: (option: SortOption) => void;
}

export function LicenseListPanel({
    licenses,
    selectedLicenseId,
    onSelectLicense,
    sortOption,
    onSortChange,
}: LicenseListPanelProps) {
    const { t } = useLanguage();
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const sortMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
                setIsSortMenuOpen(false);
            }
        };

        if (isSortMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSortMenuOpen]);

    const sortOptions: { value: SortOption; label: string; icon?: React.ElementType }[] = [
        { value: 'default', label: t('sortDefault') },
        { value: 'name-asc', label: t('sortNameAsc'), icon: ArrowDownAZ },
        { value: 'name-desc', label: t('sortNameDesc'), icon: ArrowUpAZ },
        { value: 'added-desc', label: t('sortAddedDesc'), icon: Calendar },
        { value: 'added-asc', label: t('sortAddedAsc'), icon: Calendar },
        { value: 'modified-desc', label: t('sortModifiedDesc'), icon: Clock },
        { value: 'modified-asc', label: t('sortModifiedAsc'), icon: Clock },
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 w-full shrink-0 select-none">
            {/* Filter Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center shrink-0">
                <div className="relative" ref={sortMenuRef}>
                    <button
                        onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                        className={`flex items-center transition-all duration-200 hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] ${isSortMenuOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        title={t('filter')}
                    >
                        <span className="text-sm font-medium mr-2">{t('filter')}</span>
                        <ListFilter className="h-4 w-4" />
                    </button>

                    {isSortMenuOpen && (
                        <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onSortChange(option.value);
                                        setIsSortMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between group"
                                >
                                    <div className="flex items-center">
                                        {option.icon && <option.icon className="h-4 w-4 mr-2 text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300" />}
                                        <span>{option.label}</span>
                                    </div>
                                    {sortOption === option.value && (
                                        <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

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
