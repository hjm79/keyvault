"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: string) => void;
    initialValue?: string;
    mode: 'create' | 'edit';
    onDelete?: () => void;
}

export function CategoryModal({ isOpen, onClose, onSave, initialValue = "", mode, onDelete }: CategoryModalProps) {
    const [categoryName, setCategoryName] = useState(initialValue);
    const { t } = useLanguage();

    useEffect(() => {
        setCategoryName(initialValue);
    }, [initialValue, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (categoryName.trim()) {
            onSave(categoryName.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg bg-white dark:bg-slate-800 p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {mode === 'create' ? t('addCategory') : t('editCategory')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-500 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="categoryName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t('categoryName')}
                        </label>
                        <input
                            type="text"
                            id="categoryName"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                            placeholder={t('enterCategoryName')}
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-between pt-2">
                        {mode === 'edit' && onDelete ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm(t('confirmDeleteCategory'))) {
                                        onDelete();
                                        onClose();
                                    }
                                }}
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('delete')}
                            </button>
                        ) : (
                            <div></div> // Spacer
                        )}

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={!categoryName.trim()}
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {t('save')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
