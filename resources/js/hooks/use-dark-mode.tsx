import { useEffect, useState } from 'react';

export function useDarkMode() {
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDarkMode(document.documentElement.classList.contains('dark'));
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    return isDarkMode;
}
