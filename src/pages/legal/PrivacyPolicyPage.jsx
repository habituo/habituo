import {
  Heading,
  Link,
  ListItem,
  Text,
  UnorderedList,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { useTheme } from "../../context/ThemeContext/ThemeContext";

const PrivacyPolicyPage = () => {
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
          Política de Privacidad
        </Heading>
        <Text fontSize="lg" fontStyle="italic">
          Actualizadas el 30 de mayo de 2025
        </Text>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Su privacidad nos importa. En Habituo App ("Habituo", "nosotros",
          "nos" o "nuestro"), nos comprometemos a proteger su información
          personal y a gestionarla con responsabilidad. Esta política explica
          qué datos recopilamos, por qué los recopilamos, cómo los utilizamos y
          sus derechos según el RGPD.
        </Text>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Quiénes somos
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Somos Habituo, una pequeña marca española dedicada a una plataforma
          para gestionar tareas y hábitos de la rutina diaria. Nos
          responsabilizamos de mantener la seguridad de sus datos personales y
          de garantizar que se procesen de acuerdo con el RGPD.
        </Text>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Trabajamos con proveedores externos de confianza (como servicios de
          IT) para que Habituo funcione sin problemas. Cuando compartimos sus
          datos con ellos, nos aseguramos de que los gestionen con el mismo
          cuidado y cumplimiento legal que nosotros.
        </Text>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Qué datos recopilamos
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Solo recopilamos los necesarios para prestar y mejorar nuestros
          servicios. Esto es lo que podemos recopilar:
        </Text>
        <Heading
          as="h3"
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Información que usted proporciona
        </Heading>
        <UnorderedList
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
          spacing={2}
        >
          <ListItem>Nombre y apellidos</ListItem>
          <ListItem>Correo electrónico</ListItem>
        </UnorderedList>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Datos recopilados automáticamente
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Al usar nuestra aplicación o sitio web, podemos recopilar
          automáticamente:
        </Text>
        <UnorderedList
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
          spacing={2}
        >
          <ListItem>
            Información del dispositivo (p. ej., tipo de dispositivo, sistema
            operativo)
          </ListItem>
          <ListItem>
            Datos de uso (p. ej., cómo interactúa con la aplicación o el sitio
            web)
          </ListItem>
        </UnorderedList>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Por qué recopilamos sus datos
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Recopilamos sus datos para:
        </Text>
        <UnorderedList
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
          spacing={2}
        >
          <ListItem>Proporcionar y mejorar los servicios de Habituo</ListItem>
          <ListItem>Comunicar actualizaciones y funciones</ListItem>
          <ListItem>
            Garantizar la seguridad y estabilidad de nuestra plataforma
          </ListItem>
        </UnorderedList>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Nunca utilizaremos sus datos para fines no relacionados.
        </Text>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Compartir datos
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          No vendemos sus datos personales. Sin embargo, podemos compartir sus
          datos con proveedores externos de confianza que nos ayudan a ofrecer y
          mejorar Habituo. Estos proveedores procesan sus datos en nuestro
          nombre y están obligados a cumplir con el RGPD y a mantener sus datos
          seguros.
        </Text>
        <Text
          fontSize="md"
          fontWeight={600}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Podemos compartir datos con:
        </Text>
        <UnorderedList
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
          spacing={2}
        >
          <ListItem>
            Servicios de correo electrónico para enviar mensajes personalizados
          </ListItem>
          <ListItem>
            Proveedores de IT y alojamiento para garantizar el correcto
            funcionamiento de Habituo
          </ListItem>
        </UnorderedList>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          En algunos casos, sus datos podrían procesarse fuera de la UE/EEE.
          <Text as="span" fontWeight={600}>
            {" "}
            En este caso, garantizamos la protección de sus datos mediante:
          </Text>
        </Text>
        <UnorderedList
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
          spacing={2}
        >
          <ListItem>
            Cláusulas Contractuales Tipo aprobadas por la Comisión Europea.
          </ListItem>
          <ListItem>
            Otras garantías equivalentes de conformidad con el RGPD.
          </ListItem>
          <ListItem>
            Garantizar la seguridad y estabilidad de nuestra plataforma
          </ListItem>
        </UnorderedList>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Solo compartimos la cantidad mínima de datos necesaria con estos
          proveedores para que puedan realizar sus tareas.
        </Text>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Privacidad infantil
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Como se indica en las Condiciones de Uso, no recopilamos ni
          solicitamos deliberadamente Datos Personales de menores de 16 años. Si
          usted es menor de 16 años, le rogamos que no intente registrarse ni
          utilizar los Servicios, ni que nos envíe ningún Dato Personal. Si
          descubrimos que hemos recopilado Datos Personales de un menor de 16
          años, eliminaremos dicha información lo antes posible. Si cree que un
          menor de 16 años puede habernos proporcionado Datos Personales,
          póngase en contacto con nosotros.
        </Text>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Cómo mantenemos sus datos seguros
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Nos tomamos muy en serio la seguridad y utilizamos medidas estándar
          del sector para proteger sus datos del acceso no autorizado, la
          pérdida o el uso indebido. Estas medidas incluyen cifrado, cortafuegos
          y controles de acceso.
        </Text>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Sin embargo, ningún sistema es 100 % seguro, por lo que recomendamos a
          los usuarios proteger sus cuentas manteniendo la privacidad de sus
          datos de inicio de sesión. Al usar Habituo, usted reconoce los riesgos
          asociados con la transmisión de datos en línea.
        </Text>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Base legal para el tratamiento
        </Heading>
        <Text
          fontSize="md"
          fontWeight={600}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Tratamos sus datos personales en base a:
        </Text>
        <UnorderedList
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
          spacing={2}
        >
          <ListItem>
            Su consentimiento para usar Habituo al registrarse.
          </ListItem>
          <ListItem>
            Nuestras obligaciones legales para proteger sus datos.
          </ListItem>
          <ListItem>
            Nuestro interés legítimo en mejorar Habituo, siempre que no invalide
            sus derechos.
          </ListItem>
        </UnorderedList>
      </VStack>
      <VStack my={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          ¿Quién puede acceder a sus datos?
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          No vendemos sus datos personales a nadie. Sin embargo, compartimos sus
          datos con proveedores externos de confianza para garantizar el
          correcto funcionamiento de Habituo.
        </Text>
        <Text
          fontSize="md"
          fontWeight={600}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Estos socios nos ayudan con:
        </Text>
        <UnorderedList
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
          spacing={2}
        >
          <ListItem>Servicios de correo electrónico.</ListItem>
          <ListItem>Soporte técnico.</ListItem>
          <ListItem>Análisis.</ListItem>
        </UnorderedList>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Todos los socios están obligados a cumplir con el RGPD y proteger sus
          datos. En algunos casos, los datos pueden procesarse fuera de la
          UE/EEE. En este caso, nos aseguramos de que sus datos estén protegidos
          con medidas de seguridad equivalentes.
        </Text>
      </VStack>
      <VStack mt={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Cookies y seguimiento
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Solo utilizamos cookies esenciales para el funcionamiento de Habituo.
          No recopilamos cookies destinadas al seguimiento del uso, publicidad,
          marketing, etc.
        </Text>
      </VStack>
      <VStack mt={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Durante cuánto tiempo conservamos sus datos
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Conservamos sus datos mientras tenga una cuenta registrada. Si desea
          eliminar su cuenta, póngase en contacto con nosotros y podremos
          eliminarla junto con toda la información relevante en un plazo de 30
          días.
        </Text>
      </VStack>
      <VStack mt={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Sus derechos bajo el RGPD
        </Heading>
        <UnorderedList
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
          spacing={2}
        >
          <ListItem>
            <Text as="span" fontWeight={600}>
              Acceso:{" "}
            </Text>
            Puede solicitar ver los datos personales que tenemos sobre usted.
          </ListItem>
          <ListItem>
            <Text as="span" fontWeight={600}>
              Corrección:{" "}
            </Text>
            Puede solicitarnos que corrijamos la información inexacta o
            incompleta.
          </ListItem>
          <ListItem>
            <Text as="span" fontWeight={600}>
              Eliminación:{" "}
            </Text>
            Puede solicitarnos que eliminemos sus datos cuando ya no sean
            necesarios.
          </ListItem>
          <ListItem>
            <Text as="span" fontWeight={600}>
              Restricción:{" "}
            </Text>
            Puede solicitarnos que limitemos el procesamiento de sus datos.
          </ListItem>
          <ListItem>
            <Text as="span" fontWeight={600}>
              Portabilidad:{" "}
            </Text>
            Puede solicitar sus datos en un formato legible por máquina.
          </ListItem>
          <ListItem>
            <Text as="span" fontWeight={600}>
              Oposición:{" "}
            </Text>{" "}
            Puede oponerse a ciertos tipos de procesamiento, como el marketing.
          </ListItem>
          <ListItem>
            <Text as="span" fontWeight={600}>
              Retirar el consentimiento:{" "}
            </Text>{" "}
            Puede retirar su consentimiento en cualquier momento.
          </ListItem>
        </UnorderedList>
      </VStack>
      <VStack mt={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Cómo ejercer sus derechos
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Para realizar una solicitud, envíenos un correo electrónico a{" "}
          <Link
            href="mailto:ayuda@habituo.es"
            rel="noreferrer noopener"
            color={themeOptions.focusColor}
            target="_blank"
          >
            ayuda@habituo.es
          </Link>
          . Tramitaremos su solicitud en un plazo de 30 días.
        </Text>
      </VStack>
      <VStack mt={16} alignItems="flex-start" spacing={4}>
        <Heading
          as="h2"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight={600}
          fontFamily={themeOptions.fontFamily}
        >
          Actualizaciones de esta política de privacidad
        </Heading>
        <Text
          fontSize="md"
          fontWeight={400}
          color={isLight ? "gray.900" : "gray.500"}
        >
          Podemos actualizar esta política ocasionalmente para reflejar cambios
          en nuestro servicio o requisitos legales. Si realizamos cambios
          significativos, le notificaremos por correo electrónico o a través de
          la aplicación web. Si continúa usando Habituo después de una
          actualización, significa que acepta la política revisada.
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

export default PrivacyPolicyPage;
