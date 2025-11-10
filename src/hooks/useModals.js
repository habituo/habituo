import { useState, useCallback, useMemo } from "react";

export const useModals = (initialModals = []) => {
    const [modals, setModals] = useState(
        initialModals.reduce((acc, name) => ({ ...acc, [name]: false }), {})
    );

    const openModal = useCallback((name) => {
        setModals((prev) => ({ ...prev, [name]: true }));
    }, []);

    const closeModal = useCallback((name) => {
        setModals((prev) => ({ ...prev, [name]: false }));
    }, []);

    const toggleModal = useCallback((name) => {
        setModals((prev) => ({ ...prev, [name]: !prev[name] }));
    }, []);

    const isOpen = useCallback((name) => !!modals[name], [modals]);

    const modalState = useMemo(() => modals, [modals]);

    const closeAll = useCallback(() => {
        setModals((prev) =>
            Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {})
        );
    }, []);

    return {
        modals: modalState,
        openModal,
        closeModal,
        toggleModal,
        isOpen,
        closeAll,
    };
};

export default useModals;
