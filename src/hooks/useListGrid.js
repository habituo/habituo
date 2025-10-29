import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const LOCAL_STORAGE_ORDER_KEY = "listGridConfig_orderBy";
const LOCAL_STORAGE_LAYOUT_KEY = "listGridConfig_viewLayout";

const useListGrid = () => {
    const [searchParams] = useSearchParams();

    const [config, setConfig] = useState(() => {
        const initialOrderBy = searchParams.get("order_by") || localStorage.getItem(LOCAL_STORAGE_ORDER_KEY) || "new-creation";
        const initialViewLayout = searchParams.get("layout") || localStorage.getItem(LOCAL_STORAGE_LAYOUT_KEY) || "grid";
        return {
            orderBy: initialOrderBy,
            viewLayout: initialViewLayout,
        };
    });

    const handleOrderChange = useCallback((value) => {
        setConfig(prev => ({ ...prev, orderBy: value }));
    }, []);

    const handleLayoutChange = useCallback((value) => {
        setConfig(prev => ({ ...prev, viewLayout: value }));
    }, []);

    return {
        orderBy: config.orderBy,
        viewLayout: config.viewLayout,
        handleOrderChange,
        handleLayoutChange,
    };
};

export default useListGrid;