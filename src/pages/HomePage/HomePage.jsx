import { useEffect, lazy, Suspense } from "react";
import { Text, Spinner, useColorModeValue } from "@chakra-ui/react";
import {
  Navbar,
  Footer,
  CookiesBanner,
  HeroSection,
  PersonalizationGrid,
} from "../../exports";
import dataAnalysis from "../../assets/images/illustrations/data-analysis.svg";
import editDashboard from "../../assets/images/illustrations/custom-dashboard.svg";
import { faqItems1, faqItems2 } from "../../data/faq/faq";

// Lazy load components to improve performance and reduce initial bundle size
const FeatureSection = lazy(() =>
  import("../../components/layout/FeatureSection/FeatureSection")
);
const CompleteWeek = lazy(() =>
  import("../../components/layout/CompleteWeek/CompleteWeek")
);
const FAQSection = lazy(() =>
  import("../../components/layout/FAQSection/FAQSection")
);

/**
 * HomePage Component
 *
 * This is the main landing page of the Habituo application.
 * It includes a Hero Section, personalized feature grids, habit tracking sections,
 * FAQ, and footer with cookies banner.
 *
 * The page uses lazy loading for heavier sections (FeatureSection, CompleteWeek, FAQSection)
 * to optimize performance and reduce initial page load.
 *
 * It also dynamically adjusts theme colors using Chakra UI's `useColorModeValue`.
 */
const HomePage = () => {
  // Determine highlight color based on current theme (light/dark)
  const highlightColor = useColorModeValue("orange-500", "orange-400");

  // Description for the first feature section
  const feature1Description = (
    <>
      Convierte tus objetivos en hábitos duraderos. Con{" "}
      <Text
        as="span"
        fontWeight={600}
        color={`var(--chakra-colors-${highlightColor})`}
      >
        Habituo
      </Text>
      , diseña tu rutina ideal, ajusta recordatorios y haz un seguimiento
      detallado de tu progreso con métricas visuales y análisis inteligentes.
    </>
  );

  // Description for the second feature section
  const feature2Description = (
    <>
      Tu dashboard es el centro de tu progreso. Personaliza la vista para que te
      resulte intuitiva y eficiente, dándote el control total sobre cómo
      gestionas tus hábitos diarios. Ya sea con un estilo minimalista o con un
      toque de color vibrante,{" "}
      <Text
        as="span"
        fontWeight={600}
        color={`var(--chakra-colors-${highlightColor})`}
      >
        Habituo
      </Text>{" "}
      se adapta a ti.
    </>
  );

  /**
   * useEffect hook to load external script for uptime announcements
   *
   * The script is appended to the document body when the component mounts,
   * and cleaned up when the component unmounts to avoid memory leaks.
   */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://uptime.betterstack.com/widgets/announcement.js";
    script.async = true;
    script.dataset.id = "217510"; // Widget ID for tracking
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  return (
    <>
      {/* Navbar always displayed at the top */}
      <Navbar />

      {/* Hero section for the main introduction */}
      <HeroSection />

      {/* Grid showing personalized features */}
      <PersonalizationGrid />

      {/* Suspense wraps lazy-loaded components to provide a fallback UI while loading */}
      <Suspense fallback={<Spinner size="xl" />}>
        {/* First feature section highlighting habit tracking benefits */}
        <FeatureSection
          title="El mejor tracker de hábitos para alcanzar tus metas"
          description={feature1Description}
          imageSrc={dataAnalysis}
          imageAlt="Análisis de datos de hábitos"
          reverse={false}
          textAlign="left"
        />

        {/* CompleteWeek section displays the user's weekly habit streak */}
        <CompleteWeek />

        {/* Second feature section showcasing customizable dashboard */}
        <FeatureSection
          title="Un dashboard a tu estilo"
          description={feature2Description}
          imageSrc={editDashboard}
          imageAlt="Dashboard personalizable"
          reverse={true}
          textAlign="right"
        />

        {/* FAQ section with preloaded FAQ items */}
        <FAQSection faqItems1={faqItems1} faqItems2={faqItems2} />
      </Suspense>

      {/* Footer and cookies banner */}
      <Footer />
      <CookiesBanner />
    </>
  );
};

export default HomePage;
