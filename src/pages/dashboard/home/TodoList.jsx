import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  useColorMode,
  Text,
  Divider,
  VStack,
  Editable,
  EditablePreview,
  EditableInput,
  Checkbox,
  IconButton,
  HStack,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} from "../../../hooks/database";
import { useTheme } from "../../../context/ThemeContext";
import * as LuIcons from "react-icons/lu";
import { useAuth } from "../../../context/AuthContext";

const TodoList = () => {
  const { user } = useAuth();
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask({ text: newTask.trim(), completed: false }).catch((err) => {
        toast({
          title: <Text fontWeight="600">Error al añadir la tarea</Text>,
          description: err,
          status: "error",
          position: "bottom",
        });
      });
      setNewTask("");
    }
  };

  const handleToggleComplete = (id, isCompleted) => {
    updateTask(id, { completed: !isCompleted }).catch((err) => {
      toast({
        title: <Text fontWeight="600">Error al actualizar la tarea</Text>,
        description: err,
        status: "error",
        position: "bottom",
      });
    });
  };

  const handleDeleteTask = (id) => {
    deleteTask(id).catch((err) => {
      toast({
        title: <Text fontWeight="600">Error al eliminar la tarea</Text>,
        description: err,
        status: "error",
        position: "bottom",
      });
    });
  };

  useEffect(() => {
    setLoading(true);

    const userId = user?.uid;

    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = getTasks(
      (tasks) => {
        setTodos(tasks);
        setLoading(false);
      },
      (err) => {
        toast({
          title: <Text fontWeight="600">Error al cargar las tareas</Text>,
          description: err,
          status: "error",
          position: "bottom",
        });
      },
      userId
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <Box
        p={4}
        borderRadius={themeOptions.borderRadius}
        bg={colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="150px"
        border="2px solid var(--chakra-colors-chakra-border-color)"
      >
        <Spinner size="lg" color={themeOptions.focusColor} />
      </Box>
    );
  }

  return (
    <Box
      p={4}
      pt={3}
      borderRadius={themeOptions.borderRadius}
      bg={colorMode === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
      border="2px solid var(--chakra-colors-chakra-border-color)"
    >
      <HStack pb={2} alignItems="center" justifyContent="flex-start" spacing={2}>
        <LuIcons.LuClipboardCheck size="25px" />
        <Text fontSize="xl" fontWeight={600}>
          Lista de tareas
        </Text>
      </HStack>
      <Divider />
      <VStack pt={4} spacing={0} alignItems="flex-start">
        <Editable
          px={3}
          w="100%"
          h="2.5rem"
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          gap={2}
          size="sm"
          placeholder="Crear nueva tarea"
          borderWidth={1}
          borderRadius={themeOptions.borderRadius}
          value={newTask}
          _focusVisible="none"
          onSubmit={handleAddTask}
        >
          <LuIcons.LuPlus size="16px" />
          <EditablePreview />
          <EditableInput
            onChange={(e) => setNewTask(e.target.value)}
            _focusVisible="none"
          />
        </Editable>
        {todos.map((todo) => (
          <Flex
            mt={1}
            key={todo.id}
            w="full"
            alignItems="stretch"
            justifyContent="flex-start"
            _hover={{
              button: {
                visibility: "visible",
              },
            }}
          >
            <Checkbox
              p={2}
              position="relative"
              colorScheme={themeOptions.focusColor}
              isChecked={todo.completed}
              onChange={() => handleToggleComplete(todo.id, todo.completed)}
              textDecoration={todo.completed ? "line-through" : "none"}
              borderRadius={themeOptions.borderRadius}
              flexGrow={1}
              _hover={{ bg: colorMode === "light" ? "#00000010" : "#ffffff10" }}
            >
              {todo.text}
              <IconButton
                p={0}
                w="auto"
                h="auto"
                top="50%"
                right={0}
                position="absolute"
                aria-label={`Borrar tarea ${todo.text}`}
                icon={<LuIcons.LuTrash />}
                size="sm"
                variant="unstyled"
                colorScheme="blackAlpha"
                onClick={() => handleDeleteTask(todo.id)}
                visibility="hidden"
                transform="translateY(-50%)"
              />
            </Checkbox>
          </Flex>
        ))}
        {todos.length === 0 && (
          <Box py={10} w="100%" display="flex" alignItems="center" justifyContent="center">
            <Text p={2} color={colorMode === "light" ? "#00000060" : "#FFFFFF60"}>
            Sin tareas que mostrar
          </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default TodoList;
