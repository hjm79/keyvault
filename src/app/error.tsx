'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md max-w-2xl w-full overflow-auto">
                <p className="text-slate-700 dark:text-slate-300 mb-4 font-mono text-sm text-left whitespace-pre-wrap">
                    {error.message}
                </p>
                {error.stack && (
                    <pre className="text-xs text-slate-500 dark:text-slate-400 text-left overflow-x-auto p-2 bg-slate-100 dark:bg-slate-900 rounded">
                        {error.stack}
                    </pre>
                )}
            </div>
            <button
                className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try again
            </button>
        </div>
    );
}
