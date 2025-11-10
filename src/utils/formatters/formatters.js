/**
 * Formats a given date object into a localized string (es-ES) 
 * with capitalized month name, ensuring it handles invalid dates.
 *
 * @param {Date | object} date - The date object or Firebase Timestamp object.
 * @returns {string} The formatted date string or "Sin fecha de creación".
 */
export const formatRegisteredDate = (date) => {
    // Convert Firebase Timestamp object to a Date object if necessary
    let dateObj = date;
    if (date && typeof date.toDate === "function") {
        dateObj = date.toDate();
    }

    if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
        return "Sin fecha de creación";
    }

    const options = {
        day: "2-digit",
        month: "long",
        year: "numeric",
    };

    const formattedDate = dateObj.toLocaleDateString("es-ES", options);

    // Regex to capitalize the first letter of the month after "de "
    return formattedDate.replace(
        /(\sde\s)(\w+)/,
        (match, p1, p2) => p1 + p2.charAt(0).toUpperCase() + p2.slice(1)
    );
};

/**
 * Formats a date object (or Firebase Timestamp) into a localized string (es-ES).
 */
export const formatCreationDate = (date) => {
    let finalDate;
    if (date && typeof date.toDate === "function") {
        finalDate = date.toDate();
    } else if (date instanceof Date && !Number.isNaN(date.getTime())) {
        finalDate = date;
    } else {
        return "Sin fecha de creación";
    }

    const options = { day: "2-digit", month: "long", year: "numeric" };
    const formattedDate = finalDate.toLocaleDateString("es-ES", options);

    return formattedDate.replace(
        /(\sde\s)(\w+)/,
        (match, p1, p2) => p1 + p2.charAt(0).toUpperCase() + p2.slice(1)
    );
};

/**
 * Converts a date object (or Firebase Timestamp) to an ISO string for HTML 'time' element.
 */
export const getIsoStringDate = (date) => {
    if (!date) return undefined;
    let finalDate;

    if (typeof date.toDate === "function") {
        finalDate = date.toDate();
    } else if (date instanceof Date && !Number.isNaN(date.getTime())) {
        finalDate = date;
    } else {
        return undefined;
    }

    return finalDate.toISOString();
};
