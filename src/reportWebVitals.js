/**
 * Reports Core Web Vitals metrics to a provided callback.
 * 
 * @param {Function} onPerfEntry - A callback function to handle metric results.
 * It receives an object like: { name, value, delta, id }
 */
const reportWebVitals = async (onPerfEntry) => {
  if (typeof onPerfEntry !== "function") return;

  try {
    const webVitals = await import("web-vitals");

    const metrics = [
      webVitals.getCLS,
      webVitals.getFID,
      webVitals.getFCP,
      webVitals.getLCP,
      webVitals.getTTFB,
    ];

    for (const metricFn of metrics) {
      if (typeof metricFn === "function") {
        metricFn(onPerfEntry);
      }
    };
  } catch (error) {
    throw new Error("Error loading web-vitals module:", error);
  }
};

export default reportWebVitals;
