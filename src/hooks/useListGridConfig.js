import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useListGridConfig = (initialOrderBy = "asc", initialLayout = "grid") => {
  const [orderBy, setOrderBy] = useState(initialOrderBy);
  const [viewLayout, setViewLayout] = useState(initialLayout);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  useEffect(() => {
    const orderByParam = searchParams.get("order_by");
    if (orderByParam) {
      setOrderBy(orderByParam);
    }

    const layoutParam = searchParams.get("layout");
    if (layoutParam) {
      setViewLayout(layoutParam);
    }
  }, [location.search]);

  const handleOrderChange = (newOrder) => {
    setOrderBy(newOrder);
    const params = new URLSearchParams(location.search);
    params.set("order_by", newOrder);
    navigate({ search: params.toString() });
  };

  const handleLayoutChange = (newLayout) => {
    setViewLayout(newLayout);
    const params = new URLSearchParams(location.search);
    params.set("layout", newLayout);
    navigate({ search: params.toString() });
  };

  const sortFunctions = {
    asc: (a, b) => a.name.localeCompare(b.name),
    desc: (a, b) => b.name.localeCompare(a.name),
    "last-creation": (a, b) =>
      (a.registeredAt?.getTime() || 0) - (b.registeredAt?.getTime() || 0),
    "new-creation": (a, b) =>
      (b.registeredAt?.getTime() || 0) - (a.registeredAt?.getTime() || 0),
  };

  const compareFunction = sortFunctions[orderBy] || (() => 0);

  const layoutConfig = {
    grid: {
      display: "grid",
      templateColumns: { base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" },
      gap: 3,
      minH: "auto",
      maxH: "auto",
      overflowY: "none",
    },
    list: {
      display: "flex",
      flexDirection: "column",
      gap: 3,
      minH: "calc(100vh - 90px)",
      maxH: "calc(100vh - 90px)",
      overflowY: "scroll",
    },
  };

  const currentLayoutConfig = layoutConfig[viewLayout] || layoutConfig.grid;

  return {
    orderBy,
    viewLayout,
    handleOrderChange,
    handleLayoutChange,
    sorted: (items) => [...items].sort(compareFunction),
    layoutProps: currentLayoutConfig,
  };
};

export default useListGridConfig;