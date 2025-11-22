"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { License, Category } from "@/types";
import { useLicenses } from "@/hooks/useLicenses";
import { Save, X, ExternalLink, FolderOpen } from "lucide-react";
import { useLanguage } from "./LanguageProvider";



interface LicenseFormProps {
    initialData?: License;
    licenseId?: string;
    isEdit?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function LicenseForm({ initialData, licenseId, isEdit = false, onSuccess, onCancel }: LicenseFormProps) {
    const router = useRouter();
    const { addLicense, updateLicense, categories, getAllTags, licenses } = useLicenses();
    const { t } = useLanguage();

    // Find license if ID is provided
    const licenseToEdit = licenseId ? (licenses || []).find(l => l.id === licenseId) : initialData;
    const effectiveIsEdit = isEdit || !!licenseId;

    const [formData, setFormData] = useState<Partial<License>>({
        category: 'Other',
        ...licenseToEdit,
    });

    // Update form data when licenseId changes
    useEffect(() => {
        if (licenseId) {
            const found = licenses.find(l => l.id === licenseId);
            if (found) {
                setFormData({ ...found });
                setTagsInput(found.tags?.join(", ") || "");
            }
        }
    }, [licenseId, licenses]);
    const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") || "");
    const [isLoading, setIsLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);
    const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

    // Reset image error when icon changes
    useEffect(() => {
        if (formData.icon) {
            setImageError(false);
        }
    }, [formData.icon, imageError]);

    // Handle tag input changes and filter suggestions
    const handleTagsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTagsInput(value);

        // Get the current word being typed (after the last comma)
        const lastCommaIndex = value.lastIndexOf(',');
        const currentWord = value.substring(lastCommaIndex + 1).trim();

        if (currentWord.length > 0) {
            const allTags = getAllTags();
            const existingTags = value.split(',').map(t => t.trim()).filter(t => t !== '');
            const filtered = allTags
                .filter(tag =>
                    tag.toLowerCase().includes(currentWord.toLowerCase()) &&
                    !existingTags.includes(tag)
                )
                .slice(0, 5); // Limit to 5 suggestions
            setTagSuggestions(filtered);
            setShowTagSuggestions(filtered.length > 0);
            setSelectedSuggestionIndex(-1);
        } else {
            setShowTagSuggestions(false);
            setSelectedSuggestionIndex(-1);
        }
    };

    const handleTagSuggestionClick = (tag: string) => {
        const lastCommaIndex = tagsInput.lastIndexOf(',');
        const beforeLastComma = lastCommaIndex >= 0 ? tagsInput.substring(0, lastCommaIndex + 1) : '';
        setTagsInput(beforeLastComma + (beforeLastComma ? ' ' : '') + tag + ', ');
        setShowTagSuggestions(false);
        setSelectedSuggestionIndex(-1);
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showTagSuggestions || tagSuggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev =>
                prev < tagSuggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
            e.preventDefault();
            handleTagSuggestionClick(tagSuggestions[selectedSuggestionIndex]);
        } else if (e.key === 'Escape') {
            setShowTagSuggestions(false);
            setSelectedSuggestionIndex(-1);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        const licenseData: License = {
            id: initialData?.id || crypto.randomUUID(),
            name: formData.name!,
            category: formData.category as Category || 'Other',
            version: formData.version,
            url: formData.url,
            icon: formData.icon,
            licenseKey: formData.licenseKey,
            licenseFile: formData.licenseFile,
            tags: tagsInput.split(",").map(t => t.trim()).filter(t => t !== ""),
            owner: formData.owner,
            purchaseDate: formData.purchaseDate,
            expiryDate: formData.expiryDate,
            memo: formData.memo,
            price: formData.price,
            brewCaskCommand: formData.brewCaskCommand,
        };

        if (isEdit) {
            await updateLicense(licenseData);
        } else {
            await addLicense(licenseData);
        }

        if (onSuccess) {
            onSuccess();
        } else {
            router.push("/licenses");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            let filePath = file.name;

            // Handle file copy logic here if needed, or just get path
            if (window.electronAPI) {
                const originalPath = window.electronAPI.getFilePath(file);
                filePath = originalPath; // For app bundles, we usually want the path to extract info
            }

            if (filePath.endsWith('.app')) {
                setIsLoading(true);
                try {
                    if (window.electronAPI) {
                        const result = await window.electronAPI.getAppInfo(filePath);

                        if (result.success && result.data) {
                            const updates: any = {
                                name: result.data.name,
                                version: result.data.version,
                                category: result.data.category,
                            };

                            // If we got an icon, use it directly
                            const iconData = result.data.icon;

                            if (iconData) {
                                setFormData(prev => ({
                                    ...prev,
                                    ...updates,
                                    icon: iconData
                                }));
                            } else {
                                setFormData(prev => ({ ...prev, ...updates }));
                            }
                        } else {
                            console.error("Failed to get app info:", result.error);
                            alert(t('appInfoFailed'));
                        }
                    }
                } catch (error) {
                    console.error("Error getting app info:", error);
                    alert(t('appInfoError'));
                } finally {
                    setIsLoading(false);
                }
            }
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="space-y-8 divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800 p-6 shadow rounded-lg relative"
        >
            {/* Drag Overlay Hint */}
            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-transparent group-hover:border-indigo-500 transition-colors rounded-lg" />
            <div className="space-y-8 divide-y divide-slate-200 dark:divide-slate-700">
                <div>
                    <div
                        className="mb-4"
                        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
                    >
                        <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white">
                            {isEdit ? t('editLicense') : t('newLicense')}
                        </h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t('licenseInfoDesc')}
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('programName')} *
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    value={formData.name || ""}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('category')}
                            </label>
                            <div className="mt-1">
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="version" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('version')}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="version"
                                    id="version"
                                    value={formData.version || ""}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('url')}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="url"
                                    name="url"
                                    id="url"
                                    value={formData.url || ""}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="icon" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('icon')}
                            </label>
                            <div className="mt-1 flex items-center space-x-4">
                                <div className="relative h-16 w-16 min-w-[4rem] rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                                    {formData.icon && !imageError ? (
                                        <img
                                            src={formData.icon}
                                            alt="Icon preview"
                                            className="h-full w-full object-contain"
                                            onError={() => {
                                                setImageError(true);
                                            }}
                                        />
                                    ) : (
                                        <span className="text-2xl text-slate-400">
                                            {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        id="icon-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData((prev) => ({ ...prev, icon: reader.result as string }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <div className="flex space-x-2">
                                        <label
                                            htmlFor="icon-upload"
                                            className="cursor-pointer rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            {t('selectFile')}
                                        </label>
                                        {formData.icon && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, icon: '' }))}
                                                className="rounded-md border border-red-300 dark:border-red-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            >
                                                {t('remove')}
                                            </button>
                                        )}
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('iconUploadDesc')}</p>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="icon"
                                            placeholder={t('orEnterUrl')}
                                            value={formData.icon?.startsWith('data:') ? t('imageLoaded') : (formData.icon || "")}
                                            onChange={(e) => {
                                                handleChange(e);
                                            }}
                                            onFocus={(e) => {
                                                if (formData.icon?.startsWith('data:')) {
                                                    setFormData(prev => ({ ...prev, icon: '' }));
                                                }
                                            }}
                                            className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="licenseKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('licenseKeyFile')}
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="licenseKey"
                                    name="licenseKey"
                                    rows={3}
                                    placeholder={t('enterLicenseKey')}
                                    value={formData.licenseKey || ""}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('orAttachFile')}</label>
                            <input
                                type="file"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        let filePath = file.name;

                                        if (window.electronAPI) {
                                            try {
                                                const originalPath = window.electronAPI.getFilePath(file);
                                                const result = await window.electronAPI.copyFile(originalPath);

                                                if (result.success && result.path) {
                                                    filePath = result.path;
                                                } else {
                                                    console.error("File copy failed:", result.error);
                                                    alert(`${t('fileSaveFailed')}: ${result.error}`);
                                                    return;
                                                }
                                            } catch (error) {
                                                console.error("File copy error:", error);
                                                alert(t('fileSaveError'));
                                                return;
                                            }
                                        }

                                        setFormData((prev) => ({
                                            ...prev,
                                            licenseFile: filePath,
                                        }));
                                    }
                                }}
                                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            {formData.licenseFile && (
                                <div className="mt-2 flex items-center space-x-2">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('selectedFile')}: {formData.licenseFile}</p>
                                    {typeof window !== 'undefined' && window.electronAPI && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => window.electronAPI?.openPath(formData.licenseFile!)}
                                                className="inline-flex items-center px-2 py-1 border border-slate-300 dark:border-slate-600 shadow-sm text-xs font-medium rounded text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                title={t('openFile')}
                                            >
                                                <ExternalLink className="h-3 w-3 mr-1" />
                                                {t('open')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => window.electronAPI?.showItemInFolder(formData.licenseFile!)}
                                                className="inline-flex items-center px-2 py-1 border border-slate-300 dark:border-slate-600 shadow-sm text-xs font-medium rounded text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                title={t('showInFolder')}
                                            >
                                                <FolderOpen className="h-3 w-3 mr-1" />
                                                {t('folder')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="owner" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('owner')}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="owner"
                                    id="owner"
                                    value={formData.owner || ""}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md p-2 border"
                                    placeholder={t('ownerPlaceholder')}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('tagsInput')}
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    type="text"
                                    name="tags"
                                    id="tags"
                                    value={tagsInput}
                                    onChange={handleTagsInputChange}
                                    onKeyDown={handleTagKeyDown}
                                    onFocus={() => {
                                        const currentWord = tagsInput.substring(tagsInput.lastIndexOf(',') + 1).trim();
                                        if (currentWord.length > 0) {
                                            const allTags = getAllTags();
                                            const existingTags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');
                                            const filtered = allTags
                                                .filter(tag =>
                                                    tag.toLowerCase().includes(currentWord.toLowerCase()) &&
                                                    !existingTags.includes(tag)
                                                )
                                                .slice(0, 5);
                                            if (filtered.length > 0) {
                                                setTagSuggestions(filtered);
                                                setShowTagSuggestions(true);
                                                setSelectedSuggestionIndex(-1);
                                            }
                                        }
                                    }}
                                    onBlur={() => setTimeout(() => {
                                        setShowTagSuggestions(false);
                                        setSelectedSuggestionIndex(-1);
                                    }, 200)}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md p-2 border"
                                    placeholder={t('tagsPlaceholder')}
                                />
                                {showTagSuggestions && tagSuggestions.length > 0 && (
                                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-48 overflow-auto">
                                        {tagSuggestions.map((tag, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleTagSuggestionClick(tag)}
                                                className={`w-full text-left px-3 py-2 text-slate-900 dark:text-white text-sm transition-colors ${index === selectedSuggestionIndex
                                                    ? 'bg-indigo-100 dark:bg-indigo-900'
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-600'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="purchaseDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('purchaseDate')}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="date"
                                    name="purchaseDate"
                                    id="purchaseDate"
                                    value={formData.purchaseDate || ""}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('expiryDate')}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="date"
                                    name="expiryDate"
                                    id="expiryDate"
                                    value={formData.expiryDate || ""}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('price')}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="price"
                                    id="price"
                                    value={formData.price || ""}
                                    onChange={handleChange}
                                    placeholder={t('pricePlaceholder')}
                                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="brewCaskCommand" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('brewCaskCommand')}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="brewCaskCommand"
                                    id="brewCaskCommand"
                                    value={formData.brewCaskCommand || ""}
                                    onChange={handleChange}
                                    placeholder={t('enterBrewCommand')}
                                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-slate-900 dark:text-white bg-white dark:bg-slate-700 font-mono text-xs"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="memo" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('notes')}
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="memo"
                                    name="memo"
                                    rows={3}
                                    value={formData.memo || ""}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                    placeholder={t('notesPlaceholder')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            if (onCancel) onCancel();
                            else router.back();
                        }}
                        className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        type="submit"
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {t('save')}
                    </button>
                </div>
            </div>
        </form >
    );
}
