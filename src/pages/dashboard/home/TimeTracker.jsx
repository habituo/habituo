import React, { useState, useEffect, useRef } from "react";
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

const TimeTracker = () => {
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const intervalRef = useRef(null);
  const { width, height } = useWindowSize();

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

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  useEffect(() => {
    setTimeLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setShowConfetti(true);
      clearInterval(intervalRef.current);
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
    setHours(Math.floor(totalSeconds / 3600));
    setMinutes(Math.floor((totalSeconds % 3600) / 60));
    setSeconds(totalSeconds % 60);
  };

  const formatTime = (time) => {
    const hrs = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = time % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      p={2}
      pt={1}
      borderRadius={themeOptions.borderRadius}
      bg={colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
      border="2px solid var(--chakra-colors-chakra-border-color)"
    >
      <HStack p={2} alignItems="center" justifyContent="flex-start" spacing={2}>
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
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value) || 0)}
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
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
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
              value={seconds}
              onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
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
              onClick={handlePlayPause}
              borderRadius="full"
              _focusVisible="none"
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
              onClick={handleReset}
              borderRadius="full"
              _focusVisible="none"
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
