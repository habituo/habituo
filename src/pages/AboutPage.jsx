import { Footer, Navbar } from "../exports";
import {
  Container,
  Heading,
  ListItem,
  Text,
  UnorderedList,
  useColorMode,
  VStack,
} from "@chakra-ui/react";

const AboutPage = () => {
  const { colorMode } = useColorMode();
  const isLight = colorMode === "light" ? true : false;

  return (
    <>
      <Navbar />

      <Container
        as="section"
        maxW="5xl"
        py={{ base: 5, md: 10 }}
        fontFamily="Outfit"
      >
        <VStack mb={8} alignItems="flex-start" spacing={2}>
          <Heading
            as="h1"
            fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
            fontWeight={700}
            fontFamily="Outfit"
          >
            🧠 Acerca de Habituo
          </Heading>
          <Heading
            as="h2"
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
            fontWeight={600}
            fontFamily="Outfit"
          >
            Tu compañero inteligente en el crecimiento personal
          </Heading>
        </VStack>
        <VStack my={12} alignItems="flex-start" spacing={4}>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight={500}
            color={isLight ? "gray.800" : "gray.300"}
          >
            En <b>Habituo</b>, creemos que los grandes cambios comienzan con
            pasos pequeños, pero constantes. No somos solo un{" "}
            <b>tracker de hábitos</b>: somos tu{" "}
            <b>
              aliado diario en el camino hacia una vida más consciente,
              equilibrada y plena
            </b>
            .
          </Text>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight={500}
            color={isLight ? "gray.800" : "gray.300"}
          >
            Cada día es una nueva oportunidad para crecer, aprender y avanzar
            hacia la mejor versión de ti. Nuestro propósito es acompañarte en
            ese proceso con claridad, motivación y herramientas que realmente te
            impulsen.
          </Text>
        </VStack>
        <VStack my={12} alignItems="flex-start" spacing={4}>
          <Heading
            as="h3"
            fontSize={{ base: "2xl", lg: "3xl" }}
            fontWeight={600}
            fontFamily="Outfit"
          >
            🚀 Nuestra misión: ayudarte a construir tu mejor versión
          </Heading>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight={500}
            color={isLight ? "gray.800" : "gray.300"}
          >
            Todos hemos tenido sueños que parecían inalcanzables. La diferencia
            entre quienes los logran y quienes no está en los hábitos que
            construyen su camino.
            <br />
            Por eso nació <b>Habituo</b>: para transformar el cambio personal en
            un proceso <b>simple, medible y gratificante</b>.
          </Text>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight={500}
            color={isLight ? "gray.800" : "gray.300"}
          >
            Nuestra misión es ofrecerte una experiencia que combine{" "}
            <b>ciencia del comportamiento</b>, <b>motivación inteligente</b> y{" "}
            <b>diseño humano</b>, para que transformar tu vida no sea un reto,
            sino un hábito.
          </Text>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight={500}
            color={isLight ? "gray.800" : "gray.300"}
          >
            Queremos que dejes de solo imaginar tu futuro y empieces a
            construirlo <b>día a día, hábito a hábito</b>.
          </Text>
        </VStack>
        <VStack my={12} alignItems="flex-start" spacing={4}>
          <Heading
            as="h3"
            fontSize={{ base: "2xl", lg: "3xl" }}
            fontWeight={600}
            fontFamily="Outfit"
          >
            💡 Por qué Habituo marca la diferencia
          </Heading>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight={500}
            color={isLight ? "gray.800" : "gray.300"}
          >
            Sabemos que cambiar cuesta. Pero también sabemos que no estás solo.
            Habituo está diseñado para acompañarte en cada paso, ofreciéndote un
            entorno motivador, flexible y lleno de propósito.
          </Text>
          <UnorderedList
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight={500}
            color={isLight ? "gray.800" : "gray.300"}
            spacing={2}
          >
            <ListItem>
              <Text as="span" fontWeight={600}>
                🎯 Claridad en tus metas:{" "}
              </Text>
              transforma tus grandes objetivos en microacciones diarias. Desde
              leer más hasta mejorar tu salud, cada hábito tiene su lugar y
              propósito.
            </ListItem>
            <ListItem>
              <Text as="span" fontWeight={600}>
                📊 Seguimiento visual y motivador:{" "}
              </Text>
              observa tu progreso con calendarios intuitivos y gráficos que te
              inspiran a seguir. Porque ver tus logros es la mejor recompensa.
            </ListItem>
            <ListItem>
              <Text as="span" fontWeight={600}>
                ⚙️ Flexibilidad total:{" "}
              </Text>
              adapta tus hábitos a tu ritmo de vida. Crea rutinas únicas, ajusta
              recordatorios y organiza tus áreas de enfoque como más te
              convenga.
            </ListItem>
            <ListItem>
              <Text as="span" fontWeight={600}>
                💚 Bienestar real:{" "}
              </Text>
              más que números, buscamos equilibrio. Celebra tus avances, aprende
              de tus pausas y mantente enfocado en lo que realmente importa:{" "}
              <b>tu crecimiento personal</b>.
            </ListItem>
          </UnorderedList>
        </VStack>
        <VStack my={12} alignItems="flex-start" spacing={4}>
          <Heading
            as="h3"
            fontSize={{ base: "2xl", lg: "3xl" }}
            fontWeight={600}
            fontFamily="Outfit"
          >
            🌱 Nuestra historia: de una idea a una herramienta de transformación
          </Heading>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight={500}
            color={isLight ? "gray.800" : "gray.300"}
          >
            Habituo nació de una necesidad muy personal: la de crear una
            herramienta{" "}
            <b>
              que hiciera del desarrollo personal algo más humano, visual y
              accesible
            </b>
            .<br />
            Frustrados por apps frías o complicadas, decidimos construir algo
            diferente: una plataforma que inspire, motive y acompañe.
          </Text>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight={500}
            color={isLight ? "gray.800" : "gray.300"}
          >
            Desde los primeros bocetos hasta la versión actual, hemos trabajado
            con un propósito claro:{" "}
            <b>
              crear la herramienta definitiva para formar hábitos duraderos y
              disfrutar el proceso
            </b>
            .<br /> Escuchamos activamente a nuestra comunidad, refinamos cada
            detalle y añadimos funcionalidades que realmente marcan la
            diferencia en la vida de las personas.
          </Text>
        </VStack>
        <VStack my={12} alignItems="flex-start" spacing={4}>
          <Heading
            as="h3"
            fontSize={{ base: "2xl", lg: "3xl" }}
            fontWeight={600}
            fontFamily="Outfit"
          >
            🌍 Únete a la comunidad Habituo
          </Heading>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight={500}
            color={isLight ? "gray.800" : "gray.300"}
          >
            Cada día, miles de personas en todo el mundo utilizan <b>Habituo</b>{" "}
            para diseñar una vida con más intención, propósito y equilibrio.
          </Text>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight={500}
            color={isLight ? "gray.800" : "gray.300"}
          >
            No importa si estás empezando un nuevo camino o si ya llevas años en
            tu proceso:{" "}
            <b>aquí encontrarás apoyo, inspiración y resultados reales</b>.
          </Text>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight={500}
            color={isLight ? "gray.800" : "gray.300"}
          >
            👉 Empieza hoy.
            <br />
            Convierte tus metas en hábitos, tus hábitos en progreso, y tu
            progreso en la vida que siempre has imaginado.
          </Text>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight={500}
            color={isLight ? "gray.800" : "gray.300"}
          >
            <b>Habituo. Crece. Mejora. Repite.</b>
          </Text>
        </VStack>
      </Container>

      <Footer />
    </>
  );
};

export default AboutPage;
