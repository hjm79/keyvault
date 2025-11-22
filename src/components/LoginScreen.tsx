"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";
import { Lock, ArrowRight, Globe } from "lucide-react";

interface LoginScreenProps {
    onAuthenticated: () => void;
}

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
    const { t } = useLanguage();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSetupMode, setIsSetupMode] = useState(false);
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);

    useEffect(() => {
        const storedHash = localStorage.getItem("app_password_hash");
        if (!storedHash) {
            setIsSetupMode(true);
        }
    }, []);

    const hashPassword = async (pwd: string) => {
        const msgBuffer = new TextEncoder().encode(pwd);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (isSetupMode) {
            if (password.length < 4) {
                setError(t('passwordTooShort'));
                setShake(true);
                return;
            }
            if (password !== confirmPassword) {
                setError(t('passwordsDoNotMatch'));
                setShake(true);
                return;
            }

            const hash = await hashPassword(password);
            localStorage.setItem("app_password_hash", hash);
            onAuthenticated();
        } else {
            const storedHash = localStorage.getItem("app_password_hash");
            const inputHash = await hashPassword(password);

            if (inputHash === storedHash) {
                onAuthenticated();
            } else {
                setError(t('incorrectPassword'));
                setShake(true);
                setPassword("");
            }
        }
    };

    useEffect(() => {
        if (shake) {
            const timer = setTimeout(() => setShake(false), 500);
            return () => clearTimeout(timer);
        }
    }, [shake]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 select-none" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                {/* Branding Section */}
                <div className="text-center space-y-4">
                    <div className="mx-auto h-24 w-24 relative">
                        <img
                            src="./logo.png"
                            alt="KeyVault"
                            className="h-24 w-24 object-contain drop-shadow-md"
                        />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            KeyVault
                        </h2>
                        <a
                            href="https://hjm79.top"
                            onClick={(e) => {
                                e.preventDefault();
                                if (window.electronAPI) {
                                    window.electronAPI.openExternal("https://hjm79.top");
                                } else {
                                    window.open("https://hjm79.top", "_blank");
                                }
                            }}
                            className="inline-flex items-center mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                            <Globe className="w-3 h-3 mr-1" />
                            hjm79.top
                        </a>
                    </div>
                </div>

                {/* Login Form */}
                <div className="mt-8">
                    <div className="mb-6 text-center">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                            {isSetupMode ? t('setupPassword') : t('welcomeBack')}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {isSetupMode ? t('setupPasswordDesc') : t('enterPasswordDesc')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className={`relative ${shake ? 'animate-shake' : ''}`}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-700 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-white transition-all"
                                placeholder={t('passwordPlaceholder')}
                                autoFocus
                            />
                        </div>

                        {isSetupMode && (
                            <div className={`relative ${shake ? 'animate-shake' : ''}`}>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-700 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-white transition-all"
                                    placeholder={t('confirmPasswordPlaceholder')}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="text-red-500 text-sm text-center font-medium animate-pulse">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            {isSetupMode ? t('createPassword') : t('unlock')}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
                <p>&copy; {new Date().getFullYear()} KeyVault. All rights reserved.</p>
            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
}
