import { Footer, Navbar } from "../routes";
import {
  Container,
  Heading,
  ListItem,
  Text,
  UnorderedList,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { useTheme } from "../context/ThemeContext";

const About = () => {
  const { colorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const isLight = colorMode === "light" ? true : false;

  return (
    <>
      <Navbar />

      <Container as="section" maxW="7xl" py={{ base: 10, md: 16, lg: 20 }}>
        <VStack mb={16} alignItems="flex-start" spacing={4}>
          <Heading
            as="h1"
            fontSize={{ base: "4xl", md: "6xl" }}
            fontWeight={600}
            fontFamily={themeOptions.fontFamily}
          >
            Acerca de Habituo
          </Heading>
          <Heading
            as="h2"
            fontSize={{ base: "xl", md: "4xl" }}
            fontWeight={600}
            fontFamily={themeOptions.fontFamily}
          >
            Tu compañero en el crecimiento personal
          </Heading>
        </VStack>
        <VStack my={12} alignItems="flex-start" spacing={4}>
          <Text
            fontSize="md"
            fontWeight={400}
            color={isLight ? "gray.900" : "gray.500"}
          >
            En Habituo, creemos firmemente que las grandes transformaciones
            empiezan con pequeños pasos. Somos más que un simple tracker de
            hábitos; somos tu compañero dedicado en el viaje hacia una vida más
            plena y exitosa.
          </Text>
        </VStack>
        <VStack my={12} alignItems="flex-start" spacing={4}>
          <Heading
            as="h3"
            fontSize={{ base: "lg", md: "2xl" }}
            fontWeight={600}
            fontFamily={themeOptions.fontFamily}
          >
            Nuestra misión: Impulsar tu mejor versión
          </Heading>
          <Text
            fontSize="md"
            fontWeight={400}
            color={isLight ? "gray.900" : "gray.500"}
          >
            ¿Alguna vez has tenido grandes sueños, pero te has sentido abrumado
            por el camino para alcanzarlos? Nosotros también. Por eso creamos
            Habituo: para simplificar la creación y el mantenimiento de hábitos
            positivos, y para que puedas observar tu progreso y celebrar cada
            logro, por pequeño que sea.
          </Text>
          <Text
            fontSize="md"
            fontWeight={400}
            color={isLight ? "gray.900" : "gray.500"}
          >
            Nuestra misión es clara: proporcionarte las herramientas y la
            motivación para convertir tus aspiraciones en acciones diarias, y
            tus acciones diarias en resultados duraderos. Queremos que dejes de
            solo soñar con tu futuro y empieces a construirlo, día a día, hábito
            a hábito.
          </Text>
        </VStack>
        <VStack my={12} alignItems="flex-start" spacing={4}>
          <Heading
            as="h3"
            fontSize={{ base: "lg", md: "2xl" }}
            fontWeight={600}
            fontFamily={themeOptions.fontFamily}
          >
            ¿Por qué Habituo? La diferencia está en el apoyo diario
          </Heading>
          <Text
            fontSize="md"
            fontWeight={400}
            color={isLight ? "gray.900" : "gray.500"}
          >
            Sabemos que cambiar es difícil. Por eso, hemos diseñado Habituo con
            principios basados en la ciencia del comportamiento y la psicología
            de la motivación, para ofrecerte una experiencia que realmente
            funciona:
          </Text>
          <UnorderedList
            fontSize="md"
            fontWeight={400}
            color={isLight ? "gray.900" : "gray.500"}
            spacing={2}
          >
            <ListItem>
              <Text as="span" fontWeight={600}>
                Claridad en tus metas:{" "}
              </Text>
              Te ayudamos a desglosar tus grandes objetivos en hábitos
              manejables. Desde beber más agua hasta aprender un nuevo idioma,
              cada hábito tiene su lugar.
            </ListItem>
            <ListItem>
              <Text as="span" fontWeight={600}>
                Seguimiento visual y motivador:{" "}
              </Text>
              Observa tus rachas de éxito crecer con calendarios intuitivos y
              gráficos claros. Ver tu progreso es el mayor motivador y la prueba
              de tu constancia.
            </ListItem>
            <ListItem>
              <Text as="span" fontWeight={600}>
                Flexibilidad a tu ritmo:{" "}
              </Text>
              Adaptamos los hábitos a tu vida, no al revés. Ajusta
              recordatorios, modifica frecuencias y organiza tus hábitos por
              áreas para un control total.
            </ListItem>
            <ListItem>
              <Text as="span" fontWeight={600}>
                Enfocado en tu bienestar:{" "}
              </Text>
              Más allá de las estadísticas, Habituo busca fomentar una relación
              positiva con tus metas. Celebra tus avances, aprende de tus
              desafíos y mantente enfocado en lo que realmente importa: tu
              crecimiento.
            </ListItem>
          </UnorderedList>
        </VStack>
        <VStack my={12} alignItems="flex-start" spacing={4}>
          <Heading
            as="h3"
            fontSize={{ base: "lg", md: "2xl" }}
            fontWeight={600}
            fontFamily={themeOptions.fontFamily}
          >
            Nuestra historia: De una idea a tu rutina diaria
          </Heading>
          <Text
            fontSize="md"
            fontWeight={400}
            color={isLight ? "gray.900" : "gray.500"}
          >
            Habituo nació de la necesidad personal de sus creadores de encontrar
            una forma más efectiva y agradable de construir hábitos. Frustrados
            por las aplicaciones complicadas o poco inspiradoras, decidimos
            crear la nuestra: una plataforma que fuera intuitiva, visualmente
            atractiva y verdaderamente útil para cualquiera que quiera mejorar
            su vida.
          </Text>
          <Text
            fontSize="md"
            fontWeight={400}
            color={isLight ? "gray.900" : "gray.500"}
          >
            Desde entonces, hemos trabajado incansablemente para pulir cada
            detalle, añadir funcionalidades que realmente importan y, sobre
            todo, escuchar a personas como tú para hacer de Habituo la
            herramienta definitiva para el cambio positivo.
          </Text>
        </VStack>
        <VStack my={12} alignItems="flex-start" spacing={4}>
          <Heading
            as="h3"
            fontSize={{ base: "lg", md: "2xl" }}
            fontWeight={600}
            fontFamily={themeOptions.fontFamily}
          >
            Únete a la comunidad Habituo
          </Heading>
          <Text
            fontSize="md"
            fontWeight={400}
            color={isLight ? "gray.900" : "gray.500"}
          >
            Cada día, miles de personas están usando Habituo para transformar sus vidas. Sea cual sea tu objetivo, te invitamos a unirte a nuestra comunidad. Empieza hoy mismo a construir la versión de ti que siempre has querido ser.
          </Text>
        </VStack>
      </Container>

      <Footer />
    </>
  );
};

export default About;
