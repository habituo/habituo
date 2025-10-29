import { useState, useEffect } from "react";

const defaultPreferences = {
    functional: true,
    analytics: false,
    personalization: false,
    marketing: false,
};

export function useCookiesConsent() {
    const [preferences, setPreferences] = useState(defaultPreferences);
    const [isConsentGiven, setIsConsentGiven] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("cookiePreferences");
        if (saved) {
            const parsed = JSON.parse(saved);
            setPreferences(parsed);
            setIsConsentGiven(true);
        } else {
            setShowBanner(true);
        }
    }, []);

    const acceptAll = () => {
        const allTrue = Object.fromEntries(
            Object.keys(defaultPreferences).map((key) => [key, true])
        );
        localStorage.setItem("cookiePreferences", JSON.stringify(allTrue));
        setPreferences(allTrue);
        setIsConsentGiven(true);
        setShowBanner(false);
        enableScripts(allTrue);
    };

    const rejectAll = () => {
        const rejected = { ...defaultPreferences, analytics: false, marketing: false, personalization: false };
        localStorage.setItem("cookiePreferences", JSON.stringify(rejected));
        setPreferences(rejected);
        setIsConsentGiven(true);
        setShowBanner(false);
        enableScripts(rejected);
    };

    const savePreferences = (prefs) => {
        localStorage.setItem("cookiePreferences", JSON.stringify(prefs));
        setPreferences(prefs);
        setIsConsentGiven(true);
        setShowBanner(false);
        enableScripts(prefs);
    };

    const enableScripts = (prefs) => {
        if (prefs.analytics) {
            if (!window.gtag) {
                const script = document.createElement("script");
                script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.REACT_APP_MEASUREMENT_ID}`;
                script.async = true;
                document.head.appendChild(script);
                window.dataLayer = window.dataLayer || [];
                function gtag() { window.dataLayer.push(arguments); }
                gtag("js", new Date());
                gtag("config", process.env.REACT_APP_MEASUREMENT_ID);
            }
        }
    };

    return { preferences, showBanner, acceptAll, rejectAll, savePreferences };
}
