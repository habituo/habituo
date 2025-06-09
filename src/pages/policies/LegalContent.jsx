import React from "react";
import { CookiesBanner, Footer, LegalTerms, Navbar, PrivacyPolicy } from "../../routes";
import { Container, useColorMode } from "@chakra-ui/react";
import { useTheme } from "../../context/ThemeContext";

const LegalContent = ({ content }) => {
  const { colorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const isLight = colorMode === "light" ? true : false;

  return (
    <>
      <Navbar />
      <Container
        as="main"
        maxW="7xl"
        py={{ base: 16, md: 20, lg: 24 }}
        bg={isLight ? "gray.100" : "gray.900"}
        fontFamily={themeOptions.fontFamily}
      >
        {content === "terms" ? <LegalTerms /> : <PrivacyPolicy />}
      </Container>
      <Footer />
      <CookiesBanner />
    </>
  );
};

export default LegalContent;
