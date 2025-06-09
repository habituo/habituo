import { Heading, Link, Text, useColorMode, VStack } from "@chakra-ui/react";
import { useTheme } from "../../../context/ThemeContext";

const LegalTerms = () => {
  const { colorMode } = useColorMode();
  const { themeOptions } = useTheme();
  const isLight = colorMode === "light" ? true : false;

  return (
    <>
      <VStack mb={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h1"
          fontSize={{ base: "4xl", md: "6xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Términos de Uso
        </Heading>
        <Text fontSize="lg" fontStyle="italic">
          Actualizadas el 30 de mayo de 2025
        </Text>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          ¡Bienvenido a Habituo! Continúe leyendo para conocer las normas y
          restricciones que rigen el uso de nuestro(s) sitio(s) web, productos,
          servicios y aplicaciones (los "Servicios"). Si tiene alguna pregunta,
          comentario o inquietud sobre estas condiciones o los Servicios,
          contáctenos en:{" "}
          <Link
            href="mailto:ayuda@habituo.es"
            rel="noreferrer noopener"
            color={themeOptions.focusColor}
            target="_blank"
          >
            ayuda@habituo.es
          </Link>
          . Estas Condiciones de Uso (las "Condiciones") constituyen un contrato
          vinculante entre usted y Habituo App ("Habituo", "nosotros"). Su uso
          de los Servicios, de cualquier manera, implica la aceptación de todas
          estas Condiciones, las cuales permanecerán vigentes mientras utilice
          los Servicios. Estas Condiciones incluyen las disposiciones de este
          documento, así como las de la Política de Privacidad{" "}
          <Link
            href="https://habituo.es/policy"
            rel="noreferrer noopener"
            color={themeOptions.focusColor}
            target="_blank"
          >
            https://habituo.es/policy
          </Link>
          .
        </Text>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          ¿Qué es Habituo?
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Habituo es una plataforma para gestionar las tareas y hábitos de la
          rutina diaria. Puede acceder a Habituo a través de nuestra aplicación
          web. Al registrarse en Habituo, acepta los términos aquí descritos.
        </Text>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Privacidad y seguridad de datos
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Nos tomamos muy en serio su privacidad y la protección de sus datos.
          Solo recopilamos los datos personales mínimos necesarios para prestar
          nuestros servicios y mejorar su experiencia.
        </Text>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Para más información, consulte nuestra{" "}
          <Link
            href="https://habituo.es/policy"
            rel="noreferrer noopener"
            color={themeOptions.focusColor}
            target="_blank"
          >
            Política de Privacidad
          </Link>
          .
        </Text>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Seguridad de datos
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Utilizamos medidas de seguridad estándar del sector para proteger sus
          datos del acceso no autorizado. Sin embargo, no podemos garantizar una
          seguridad del 100 %, ya que existen riesgos como ciberataques u otras
          amenazas externas.
        </Text>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Al usar Habituo, usted reconoce que ningún servicio en línea está
          completamente libre de riesgos y acepta usar Habituo a su propia
          discreción.
        </Text>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Responsabilidad sobre el contenido
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          La información de nuestro sitio web se proporciona únicamente con
          fines informativos generales. Si bien nos esforzamos al máximo por
          mantener el contenido preciso y actualizado, no garantizamos su
          integridad, exactitud, fiabilidad, idoneidad ni disponibilidad. La
          confianza que deposite en la información proporcionada es bajo su
          propio riesgo.
        </Text>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          En la medida máxima permitida por la ley, declinamos toda
          responsabilidad por pérdidas directas, indirectas o consecuentes
          derivadas del uso o la confianza que deposite en el contenido de
          nuestro sitio web.
        </Text>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Mantenimiento y disponibilidad
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Trabajamos constantemente para mejorar y actualizar Habituo. Si bien
          nos esforzamos por ofrecer un servicio ininterrumpido, es posible que
          se produzcan interrupciones ocasionales debido al mantenimiento, las
          actualizaciones o factores ajenos a nuestro control (por ejemplo,
          cortes de internet o problemas con terceros). Haremos todo lo posible
          por notificarle con antelación sobre el mantenimiento planificado.
        </Text>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Responsabilidad y exención de garantías
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Al utilizar Habituo, usted acepta utilizar el servicio bajo su propio
          riesgo. Habituo presta sus servicios "tal cual" y declina toda
          garantía, ya sea expresa o implícita, en la medida permitida por la
          ley.
        </Text>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Nos esforzamos por mantener altos estándares de seguridad, pero no
          podemos garantizar la prevención de accesos no autorizados,
          filtraciones de datos u otros ataques externos.
        </Text>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Enlaces de terceros
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Nuestra aplicación web puede contener enlaces a sitios web o servicios
          de terceros. Proporcionamos estos enlaces para su comodidad, pero no
          nos hacemos responsables del contenido, las prácticas de privacidad ni
          la disponibilidad de estos sitios externos. Accede a enlaces de
          terceros bajo su propia responsabilidad.
        </Text>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Cambios en estos términos
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Podemos actualizar estos Términos de Uso periódicamente para reflejar
          cambios en nuestros servicios o requisitos legales. Si se realizan
          cambios significativos, se lo notificaremos por correo electrónico o a
          través de la aplicación. Si continúa utilizando Habituo después de
          cualquier actualización, significa que acepta los términos revisados.
        </Text>
      </VStack>
      <VStack mt={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Contáctenos
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Si tiene alguna pregunta o inquietud sobre esta política, puede
          contactarnos en:
        </Text>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          <Link
            href="mailto:ayuda@habituo.es"
            rel="noreferrer noopener"
            color={themeOptions.focusColor}
            target="_blank"
          >
            ayuda@habituo.es
          </Link>
        </Text>
      </VStack>
    </>
  );
};

export default LegalTerms;
