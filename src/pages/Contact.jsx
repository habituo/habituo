import React, { useState } from "react";
import {
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { Footer, Navbar } from "../routes";
import { useTheme } from "../context/ThemeContext";

const Contact = () => {
  const { colorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const isLight = colorMode === "light";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const FORMSPREE_URL = "https://formspree.io/f/mgvyabnl";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          _replyto: email,
          subject: subject,
          message: message,
          _subject: `Mensaje de contacto desde la web de Habituo: ${subject}`,
        }),
      });

      if (response.ok) {
        toast({
          title: <Text fontWeight={600}>Mensaje enviado</Text>,
          description: "Hemos recibido tu mensaje y te responderemos pronto.",
          status: "success",
          position: "bottom",
        });
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        toast({
          title: <Text fontWeight={600}>Error al enviar</Text>,
          description: "Hubo un problema. Inténtalo de nuevo más tarde.",
          status: "error",
          position: "bottom",
        });
      }
    } catch (error) {
      toast({
        title: <Text fontWeight={600}>Error de red</Text>,
        description: "No se pudo conectar con el servidor. Revisa tu conexión.",
        status: "error",
        position: "bottom",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container as="main" maxW="7xl" py={{ base: 10, md: 16, lg: 20 }}>
        <VStack
          spacing={{ base: 8, lg: 10 }}
          alignItems="center"
          textAlign="center"
        >
          <Heading
            as="h1"
            fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
            fontWeight="extrabold"
            lineHeight="shorter"
            color={isLight ? "gray.800" : "white"}
          >
            Contáctanos
          </Heading>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            maxW="2xl"
            color={isLight ? "gray.600" : "gray.300"}
          >
            ¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para
            escucharte. Rellena el formulario y te responderemos lo antes
            posible.
          </Text>

          <VStack
            as="form"
            onSubmit={handleSubmit}
            spacing={6}
            mt={10}
            p={{ base: 6, md: 8, lg: 10 }}
            bg={isLight ? "white" : "gray.700"}
            borderRadius="lg"
            boxShadow="xl"
            maxW="md"
            w="full"
          >
            <FormControl id="name" isRequired>
              <FormLabel color={isLight ? "gray.700" : "whiteAlpha.800"}>
                Tu Nombre
              </FormLabel>
              <Input
                type="text"
                placeholder="Ej: Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                _focusVisible="none"
                color={isLight ? "gray.800" : "white"}
              />
            </FormControl>

            <FormControl id="email" isRequired>
              <FormLabel color={isLight ? "gray.700" : "whiteAlpha.800"}>
                Tu Correo Electrónico
              </FormLabel>
              <Input
                type="email"
                placeholder="Ej: tu.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                _focusVisible="none"
                color={isLight ? "gray.800" : "white"}
              />
            </FormControl>

            <FormControl id="subject">
              <FormLabel color={isLight ? "gray.700" : "whiteAlpha.800"}>
                Asunto
              </FormLabel>
              <Input
                type="text"
                placeholder="Ej: Consulta sobre mi cuenta"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                _focusVisible="none"
                color={isLight ? "gray.800" : "white"}
              />
            </FormControl>

            <FormControl id="message" isRequired>
              <FormLabel color={isLight ? "gray.700" : "whiteAlpha.800"}>
                Tu Mensaje
              </FormLabel>
              <Textarea
                placeholder="Escribe tu mensaje aquí..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                size="md"
                resize="vertical"
                minH="100px"
                _focusVisible="none"
                color={isLight ? "gray.800" : "white"}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme={themeOptions.focusColor}
              size="lg"
              width="full"
              isLoading={isSubmitting}
              loadingText="Enviando..."
            >
              Enviar Mensaje
            </Button>
          </VStack>
        </VStack>
      </Container>

      <Footer />
    </>
  );
};

export default Contact;
