import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Box,
  Text,
  Input,
  HStack,
  Button,
  VStack,
  useColorMode,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import Confetti from "react-confetti";
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";

function useTimer(initialSeconds = 0) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const hasBeenStartedRef = useRef(false);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      hasBeenStartedRef.current = true;
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      setIsRunning(false);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setIsRunning(false);
    hasBeenStartedRef.current = false;
  }, [initialSeconds]);

  const toggle = useCallback(() => {
    if (timeLeft > 0 || isRunning) {
      setIsRunning((prev) => !prev);
    }
  }, [timeLeft, isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(initialSeconds);
    hasBeenStartedRef.current = false;
  }, [initialSeconds]);

  return {
    timeLeft,
    isRunning,
    toggle,
    reset,
    hasBeenStartedRef,
  };
}

const TimeTrackerPage = () => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [initialHours, setInitialHours] = useState(0);
  const [initialMinutes, setInitialMinutes] = useState(0);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const initialTimeInSeconds = useMemo(
    () => initialHours * 3600 + initialMinutes * 60 + initialSeconds,
    [initialHours, initialMinutes, initialSeconds]
  );

  const { timeLeft, isRunning, toggle, reset, hasBeenStartedRef } =
    useTimer(initialTimeInSeconds);

  useEffect(() => {
    if (
      timeLeft === 0 &&
      !isRunning &&
      initialTimeInSeconds > 0 &&
      hasBeenStartedRef.current
    ) {
      setShowConfetti(true);
      toast({
        title: <Text fontWeight={600}>¡Tiempo terminado!</Text>,
        description: "¡Has completado tu sesión de tiempo!",
        status: "success",
        position: "bottom",
      });
      const confettiTimeout = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(confettiTimeout);
    }
  }, [timeLeft, isRunning, initialTimeInSeconds, hasBeenStartedRef, toast]);

  const formatTime = useCallback((timeInSeconds) => {
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = timeInSeconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleHoursChange = useCallback((e) => {
    const value = parseInt(e.target.value);
    setInitialHours(isNaN(value) || value < 0 ? 0 : Math.max(0, value));
  }, []);

  const handleMinutesChange = useCallback((e) => {
    const value = parseInt(e.target.value);
    setInitialMinutes(isNaN(value) || value < 0 ? 0 : Math.min(value, 59));
  }, []);

  const handleSecondsChange = useCallback((e) => {
    const value = parseInt(e.target.value);
    setInitialSeconds(isNaN(value) || value < 0 ? 0 : Math.min(value, 59));
  }, []);

  const canResetTimer = hasBeenStartedRef.current;

  return (
    <Box
      p={4}
      borderRadius={themeOptions.borderRadius}
      bg={colorMode === "light" ? "white" : "black"}
      border="2px solid var(--chakra-colors-chakra-border-color)"
    >
      <VStack
        pb={4}
        alignItems="flex-start"
        justifyContent="flex-start"
        spacing={1}
      >
        <Text fontSize="xl" fontWeight={600}>
          Temporizador
        </Text>
        <HStack spacing={2} alignItems="flex-end">
          <FormControl>
            <FormLabel
              m={0}
              fontSize="xs"
              textTransform="uppercase"
              color={colorMode === "light" ? "#00000060" : "#FFFFFF60"}
            >
              Horas
            </FormLabel>
            <Input
              type="number"
              min="0"
              placeholder="Horas"
              borderRadius={themeOptions.borderRadius}
              _focusVisible={{}}
              value={initialHours}
              onChange={handleHoursChange}
              isDisabled={isRunning}
            />
          </FormControl>
          <Text fontSize="xl" fontWeight={600} lineHeight="44px">
            :
          </Text>
          <FormControl>
            <FormLabel
              m={0}
              fontSize="xs"
              textTransform="uppercase"
              color={colorMode === "light" ? "#00000060" : "#FFFFFF60"}
            >
              Minutos
            </FormLabel>
            <Input
              type="number"
              min="0"
              max="59"
              placeholder="Minutos"
              borderRadius={themeOptions.borderRadius}
              _focusVisible={{}}
              value={initialMinutes}
              onChange={handleMinutesChange}
              isDisabled={isRunning}
            />
          </FormControl>
          <Text fontSize="xl" fontWeight={600} lineHeight="44px">
            :
          </Text>
          <FormControl>
            <FormLabel
              m={0}
              fontSize="xs"
              textTransform="uppercase"
              color={colorMode === "light" ? "#00000060" : "#FFFFFF60"}
            >
              Segundos
            </FormLabel>
            <Input
              type="number"
              min="0"
              max="59"
              placeholder="Segundos"
              borderRadius={themeOptions.borderRadius}
              _focusVisible={{}}
              value={initialSeconds}
              onChange={handleSecondsChange}
              isDisabled={isRunning}
            />
          </FormControl>
        </HStack>
      </VStack>
      <VStack
        p={4}
        w="100%"
        minH="calc(100% - 108px)"
        justifyContent="center"
        borderRadius={themeOptions.borderRadius}
        bg={isRunning ? "#fee042" : colorMode === "light" ? "#f9f9f9" : "#000"}
        spacing={6}
      >
        <Text
          fontSize={{ base: "40px", md: "30px", lg: "50px" }}
          fontWeight={600}
          textAlign="center"
          color={isRunning ? "#000" : ""}
        >
          {formatTime(timeLeft)}
        </Text>
        <HStack spacing={2}>
          <Button
            w="50px"
            h="50px"
            bg={colorMode === "light" ? "#fff" : "#000"}
            color={colorMode === "light" ? "#000" : "#fff"}
            border="2px solid var(--chakra-colors-chakra-border-color)"
            onClick={toggle}
            borderRadius="full"
            _focusVisible={{}}
            isDisabled={initialTimeInSeconds <= 0 && !isRunning}
          >
            {isRunning ? <FaPause /> : <FaPlay />}
          </Button>
          <Button
            w="50px"
            h="50px"
            bg={
              isRunning
                ? "red.500"
                : colorMode === "light"
                ? "gray.100"
                : "gray.800"
            }
            color={
              colorMode === "light" ? (isRunning ? "#fff" : "#000") : "#fff"
            }
            onClick={reset}
            borderRadius="full"
            _focusVisible={{}}
            isDisabled={!canResetTimer}
          >
            <FaStop />
          </Button>
        </HStack>
      </VStack>
      {showConfetti && <Confetti recycle={false} />}
    </Box>
  );
};

export default TimeTrackerPage;
