import { useState } from "react";
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
import { Footer, Navbar } from "../exports";

const ContactPage = () => {
  const { colorMode } = useColorMode();
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

      <Container
        as="main"
        maxW="5xl"
        py={{ base: 4, md: 10 }}
        fontFamily="Outfit"
      >
        <VStack alignItems="center" textAlign="center" spacing={4}>
          <Heading
            as="h1"
            fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
            fontWeight={700}
            fontFamily="Outfit"
          >
            Contáctanos
          </Heading>
          <Text
            maxW="2xl"
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight={600}
            color={isLight ? "gray.600" : "gray.300"}
          >
            ¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para
            escucharte. Rellena el formulario y te responderemos lo antes
            posible.
          </Text>

          <VStack
            as="form"
            mt={8}
            onSubmit={handleSubmit}
            spacing={6}
            p={8}
            bg={isLight ? "white" : "black"}
            borderRadius="3xl"
            maxW="md"
            w="full"
          >
            <FormControl id="name" isRequired>
              <FormLabel>Nombre completo</FormLabel>
              <Input
                type="text"
                size="lg"
                placeholder="Ej: Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                borderRadius="2xl"
                _focusVisible={{}}
              />
            </FormControl>

            <FormControl id="email" isRequired>
              <FormLabel>Correo electrónico</FormLabel>
              <Input
                type="email"
                size="lg"
                placeholder="Ej: tu.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                borderRadius="2xl"
                _focusVisible={{}}
              />
            </FormControl>

            <FormControl id="subject">
              <FormLabel>Asunto</FormLabel>
              <Input
                type="text"
                size="lg"
                placeholder="Ej: Consulta sobre mi cuenta"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                borderRadius="2xl"
                _focusVisible={{}}
              />
            </FormControl>

            <FormControl id="message" isRequired>
              <FormLabel>Mensaje</FormLabel>
              <Textarea
                placeholder="Escribe tu mensaje aquí..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                size="lg"
                resize="vertical"
                minH="100px"
                borderRadius="2xl"
                _focusVisible={{}}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="orange"
              size="lg"
              width="full"
              borderRadius="full"
              isLoading={isSubmitting}
              loadingText="Enviando..."
            >
              Enviar mensaje
            </Button>
          </VStack>
        </VStack>
      </Container>

      <Footer />
    </>
  );
};

export default ContactPage;
