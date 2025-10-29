const normalizeDateForSorting = (dateValue) => {
    if (dateValue && typeof dateValue.toDate === 'function') {
        const date = dateValue.toDate();
        return date instanceof Date && !isNaN(date.getTime()) ? date.getTime() : 0;
    }
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        return dateValue.getTime();
    }
    return 0;
};

export const compareByOrder = (a, b, orderBy) => {
    const nameA = a.name ? String(a.name).toLowerCase() : '';
    const nameB = b.name ? String(b.name).toLowerCase() : '';

    const createdAtA = normalizeDateForSorting(a.createdAt);
    const createdAtB = normalizeDateForSorting(b.createdAt);

    switch (orderBy) {
        case "name-asc":
            return nameA.localeCompare(nameB);
        case "name-desc":
            return nameB.localeCompare(nameA);
        case "new-creation":
            if (createdAtA === 0 && createdAtB === 0) return 0;
            if (createdAtA === 0) return 1;
            if (createdAtB === 0) return -1;
            return createdAtB - createdAtA;
        case "old-creation":
            if (createdAtA === 0 && createdAtB === 0) return 0;
            if (createdAtA === 0) return 1;
            if (createdAtB === 0) return -1;
            return createdAtA - createdAtB;
        default:
            return 0;
    }
};