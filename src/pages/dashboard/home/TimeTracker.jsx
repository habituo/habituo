import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Text,
  Input,
  HStack,
  Button,
  VStack,
  useColorMode,
  Divider,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import Confetti from "react-confetti";
import { useTheme } from "../../../context/ThemeContext";
import * as LuIcons from "react-icons/lu";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

function useTimer(initialSeconds = 0) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const hasBeenStartedRef = useRef(false);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setIsRunning(false);
    clearInterval(intervalRef.current);
    hasBeenStartedRef.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      hasBeenStartedRef.current = true;
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const start = useCallback(() => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  }, [timeLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(initialSeconds);
    hasBeenStartedRef.current = false;
  }, [initialSeconds]);

  const toggle = useCallback(() => {
    if (timeLeft > 0 || isRunning) {
      setIsRunning((prev) => {
        if (!prev) {
          hasBeenStartedRef.current = true;
        }
        return !prev;
      });
    }
  }, [timeLeft, isRunning]);
  return {
    timeLeft,
    isRunning,
    start,
    pause,
    reset,
    toggle,
    setTimeLeft,
    hasBeenStartedRef,
  };
}

const TimeTracker = () => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const { width, height } = useWindowSize();
  const [initialHours, setInitialHours] = useState(0);
  const [initialMinutes, setInitialMinutes] = useState(0);
  const [initialSeconds, setInitialSeconds] = useState(0);

  const initialTimeInSeconds = useMemo(
    () => initialHours * 3600 + initialMinutes * 60 + initialSeconds,
    [initialHours, initialMinutes, initialSeconds]
  );

  const { timeLeft, isRunning, toggle, reset, hasBeenStartedRef } =
    useTimer(initialTimeInSeconds);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (
      timeLeft === 0 &&
      !isRunning &&
      initialTimeInSeconds > 0 &&
      hasBeenStartedRef.current
    ) {
      setShowConfetti(true);
      hasBeenStartedRef.current = false;
      const confettiTimeout = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(confettiTimeout);
    }
  }, [timeLeft, isRunning, initialTimeInSeconds, hasBeenStartedRef]);

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
    setInitialHours(isNaN(value) || value < 0 ? 0 : value);
  }, []);

  const handleMinutesChange = useCallback((e) => {
    const value = parseInt(e.target.value);
    setInitialMinutes(isNaN(value) || value < 0 ? 0 : Math.min(value, 59));
  }, []);

  const handleSecondsChange = useCallback((e) => {
    const value = parseInt(e.target.value);
    setInitialSeconds(isNaN(value) || value < 0 ? 0 : Math.min(value, 59));
  }, []);

  const canStartTimer = initialTimeInSeconds > 0;

  return (
    <Box
      p={4}
      borderRadius={themeOptions.borderRadius}
      bg={colorMode === "light" ? "white" : "black"}
      border="2px solid var(--chakra-colors-chakra-border-color)"
    >
      <HStack pb={2} alignItems="center" justifyContent="flex-start" spacing={2}>
        <LuIcons.LuTimer size="25px" />
        <Text fontSize="xl" fontWeight={600}>
          Temporizador
        </Text>
      </HStack>
      <Divider />
      <VStack pt={4} alignItems="stretch" justifyContent="stretch">
        <HStack px={2} spacing={2}>
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
              size="sm"
              placeholder="Horas"
              borderRadius={themeOptions.borderRadius}
              _focusVisible="none"
              value={initialHours}
              onChange={handleHoursChange}
              isDisabled={isRunning}
            />
          </FormControl>
          <Text fontSize="xl" fontWeight={600}>
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
              size="sm"
              placeholder="Minutos"
              borderRadius={themeOptions.borderRadius}
              _focusVisible="none"
              value={initialMinutes}
              onChange={handleMinutesChange}
              isDisabled={isRunning}
            />
          </FormControl>
          <Text fontSize="xl" fontWeight={600}>
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
              size="sm"
              placeholder="Segundos"
              borderRadius={themeOptions.borderRadius}
              _focusVisible="none"
              value={initialSeconds}
              onChange={handleSecondsChange}
              isDisabled={isRunning}
            />
          </FormControl>
        </HStack>
        <VStack
          p={4}
          w="100%"
          borderRadius={themeOptions.borderRadius}
          bg={isRunning ? "#fee042" : colorMode === "light" ? "#fff" : "#000"}
          spacing={4}
        >
          <Text
            py={6}
            fontSize="50px"
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
              _focusVisible="none"
              isDisabled={!canStartTimer && !isRunning}
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
              _focusVisible="none"
              isDisabled={!canStartTimer && !isRunning}
            >
              <FaStop />
            </Button>
          </HStack>
        </VStack>
      </VStack>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={5000}
          gravity={0.4}
          initialVelocityX={0}
          initialVelocityY={100}
          tweenDuration={500}
        />
      )}
    </Box>
  );
};

export default TimeTracker;
