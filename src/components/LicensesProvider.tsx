"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { License } from "@/types";

const STORAGE_KEY = "app_licenses";



interface LicensesContextType {
    licenses: License[];
    categories: string[];
    loading: boolean;
    addLicense: (license: License) => Promise<void>;
    updateLicense: (updated: License) => Promise<void>;
    deleteLicense: (id: string) => Promise<void>;
    addCategory: (category: string) => Promise<void>;
    updateCategory: (oldName: string, newName: string) => Promise<void>;
    deleteCategory: (category: string) => Promise<void>;
    refreshLicenses: () => Promise<void>;
    getAllTags: () => string[];
}

const DEFAULT_CATEGORIES = [
    'Development', 'Design', 'Productivity', 'Utility', 'Office',
    'Social', 'Entertainment', 'Education', 'Finance',
    'Game', 'Music', 'Video', 'Other'
];

const LicensesContext = createContext<LicensesContextType | undefined>(undefined);

export function LicensesProvider({ children }: { children: React.ReactNode }) {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            if (typeof window !== 'undefined' && window.electronAPI) {
                // Electron Environment
                const loadedLicenses = await window.electronAPI.loadLicenses();
                let loadedCategories: string[] = [];
                try {
                    loadedCategories = await window.electronAPI.loadCategories();
                } catch (e) {
                    console.error("Failed to load categories from Electron:", e);
                }

                setLicenses(Array.isArray(loadedLicenses) ? loadedLicenses : []);
                setCategories(Array.isArray(loadedCategories) && loadedCategories.length > 0 ? loadedCategories : DEFAULT_CATEGORIES);
            } else if (typeof window !== 'undefined') {
                // Browser Environment (Fallback)
                const storedLicenses = localStorage.getItem(STORAGE_KEY);
                const storedCategories = localStorage.getItem("app_categories");

                if (storedLicenses) {
                    try {
                        setLicenses(JSON.parse(storedLicenses));
                    } catch (e) {
                        console.error("Failed to parse licenses", e);
                    }
                }

                if (storedCategories) {
                    try {
                        setCategories(JSON.parse(storedCategories));
                    } catch (e) {
                        console.error("Failed to parse categories", e);
                    }
                } else {
                    // Default categories
                    setCategories(DEFAULT_CATEGORIES);
                }
            }
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const saveLicensesData = async (newLicenses: License[]) => {
        setLicenses(newLicenses);
        if (typeof window !== 'undefined' && window.electronAPI) {
            await window.electronAPI.saveLicenses(newLicenses);
        } else if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newLicenses));
        }
    };

    const saveCategoriesData = async (newCategories: string[]) => {
        setCategories(newCategories);
        if (typeof window !== 'undefined' && window.electronAPI) {
            await window.electronAPI.saveCategories(newCategories);
        } else if (typeof window !== 'undefined') {
            localStorage.setItem("app_categories", JSON.stringify(newCategories));
        }
    };

    const addLicense = async (license: License) => {
        const newLicense = {
            ...license,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const newLicenses = [...licenses, newLicense];
        await saveLicensesData(newLicenses);
    };

    const updateLicense = async (updated: License) => {
        const updatedLicense = {
            ...updated,
            updatedAt: new Date().toISOString()
        };
        const newLicenses = licenses.map((l) => (l.id === updatedLicense.id ? updatedLicense : l));
        await saveLicensesData(newLicenses);
    };

    const deleteLicense = async (id: string) => {
        const newLicenses = licenses.filter((l) => l.id !== id);
        await saveLicensesData(newLicenses);
    };

    const addCategory = async (category: string) => {
        if (!categories.includes(category)) {
            const newCategories = [...categories, category];
            await saveCategoriesData(newCategories);
        }
    };

    const updateCategory = async (oldName: string, newName: string) => {
        if (categories.includes(oldName) && !categories.includes(newName)) {
            const newCategories = categories.map(c => c === oldName ? newName : c);
            await saveCategoriesData(newCategories);

            // Update licenses with this category
            const newLicenses = licenses.map(l => {
                if (l.category === oldName) {
                    return { ...l, category: newName };
                }
                return l;
            });
            await saveLicensesData(newLicenses);
        }
    };

    const deleteCategory = async (category: string) => {
        const newCategories = categories.filter(c => c !== category);
        await saveCategoriesData(newCategories);

        // Move licenses to 'Other'
        const newLicenses = licenses.map(l => {
            if (l.category === category) {
                return { ...l, category: 'Other' };
            }
            return l;
        });
        await saveLicensesData(newLicenses);
    };

    const refreshLicenses = async () => {
        setLoading(true);
        await loadData();
    };

    const getAllTags = () => {
        const tagsSet = new Set<string>();
        licenses.forEach(license => {
            license.tags?.forEach(tag => {
                if (tag.trim()) {
                    tagsSet.add(tag.trim());
                }
            });
        });
        return Array.from(tagsSet).sort();
    };

    return (
        <LicensesContext.Provider
            value={{
                licenses,
                categories,
                loading,
                addLicense,
                updateLicense,
                deleteLicense,
                addCategory,
                updateCategory,
                deleteCategory,
                refreshLicenses,
                getAllTags,
            }}
        >
            {children}
        </LicensesContext.Provider>
    );
}

export function useLicenses() {
    const context = useContext(LicensesContext);
    if (context === undefined) {
        throw new Error("useLicenses must be used within a LicensesProvider");
    }
    return context;
}
