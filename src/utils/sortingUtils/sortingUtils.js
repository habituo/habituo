/**
 * Normalizes Firestore Timestamps or Date objects for numeric comparison.
 * Returns a timestamp (number) or 0 if invalid.
 */
const normalizeDateForSorting = (dateValue) => {
    if (dateValue && typeof dateValue.toDate === "function") {
        const date = dateValue.toDate();
        return date instanceof Date && !Number.isNaN(date.getTime())
            ? date.getTime()
            : 0;
    }

    if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
        return dateValue.getTime();
    }

    return 0;
};

/**
 * Compares two normalized date values with fallback handling for missing dates.
 * @param {number} dateA - Timestamp (ms) or 0 if invalid.
 * @param {number} dateB - Timestamp (ms) or 0 if invalid.
 * @param {"asc" | "desc"} direction - Comparison direction.
 * @returns {number} Sorting result (-1, 0, 1)
 */
const compareDates = (dateA, dateB, direction = "asc") => {
    if (dateA === 0 && dateB === 0) return 0;
    if (dateA === 0) return 1;
    if (dateB === 0) return -1;
    return direction === "asc" ? dateA - dateB : dateB - dateA;
};

/**
 * Compares two strings case-insensitively.
 */
const compareStrings = (a, b, direction = "asc") => {
    const nameA = (a ?? "").toString().toLowerCase();
    const nameB = (b ?? "").toString().toLowerCase();

    return direction === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
};

/**
 * Generalized comparison function for multiple sorting criteria.
 * @param {Object} a - First object.
 * @param {Object} b - Second object.
 * @param {string} orderBy - Sorting mode ("name-asc", "name-desc", "new-creation", "old-creation").
 * @returns {number} Sorting result (-1, 0, 1)
 */
export const compareByOrder = (a, b, orderBy) => {
    const createdAtA = normalizeDateForSorting(a.createdAt);
    const createdAtB = normalizeDateForSorting(b.createdAt);

    switch (orderBy) {
        case "name-asc":
            return compareStrings(a.name, b.name, "asc");

        case "name-desc":
            return compareStrings(a.name, b.name, "desc");

        case "new-creation":
            return compareDates(createdAtA, createdAtB, "desc");

        case "old-creation":
            return compareDates(createdAtA, createdAtB, "asc");

        default:
            return 0;
    }
};
