"use client";

import { Suspense } from "react";
import { LicenseManager } from "@/components/LicenseManager";
import { useLanguage } from "@/components/LanguageProvider";

function LicensePageContent() {
    return <LicenseManager />;
}

export default function LicensePage() {
    const { t } = useLanguage();

    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-slate-500 dark:text-slate-400">{t('loading')}</div>
            </div>
        }>
            <LicensePageContent />
        </Suspense>
    );
}
