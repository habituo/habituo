import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useAuthUser } from "../../../context/AuthUserContext";
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
  Center,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} from "../../../hooks/database";
import * as LuIcons from "react-icons/lu";

const TodoList = () => {
  const { user, loading: authLoading } = useAuthUser();
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  const showToastError = useCallback(
    (title, error) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast({
        title: <Text fontWeight={600}>{title}</Text>,
        description: errorMessage || "Ha ocurrido un error inesperado.",
        status: "error",
        position: "bottom",
      });
    },
    [toast]
  );

  const showToastSuccess = useCallback(
    (title, description = "") => {
      toast({
        title: <Text fontWeight={600}>{title}</Text>,
        description: description,
        status: "success",
        position: "bottom",
      });
    },
    [toast]
  );

  const handleAddTask = async () => {
    if (!user?.uid) {
      showToastError("Error al añadir una tarea", new Error("Usuario no autenticado."));
      return;
    }

    if (newTask.trim() === "") {
      showToastError("Entrada inválida", new Error("La entrada está vacía."));
      return;
    }

    try {
      setLoadingTasks(true);
      await addTask({ text: newTask.trim(), completed: false }, user.uid);
      setNewTask("");
      showToastSuccess(
        "Tarea añadida",
        "La tarea se ha añadido correctamente."
      );
    } catch (err) {
      showToastError("Error al añadir la tarea", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleToggleComplete = async (id, isCompleted) => {
    if (!user?.uid) {
      showToastError(
        "Error de autenticación",
        new Error("Debes iniciar sesión para actualizar tareas.")
      );
      return;
    }
    try {
      await updateTask(id, { completed: !isCompleted }, user.uid);
      showToastSuccess(
        "Tarea actualizada",
        "El estado de la tarea ha cambiado."
      );
    } catch (err) {
      showToastError("Error al actualizar la tarea", err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!user?.uid) {
      showToastError(
        "Error de autenticación",
        new Error("Debes iniciar sesión para eliminar tareas.")
      );
      return;
    }
    try {
      await deleteTask(id, user.uid);
      showToastSuccess(
        "Tarea eliminada",
        "La tarea se ha eliminado correctamente."
      );
    } catch (err) {
      showToastError("Error al eliminar la tarea", err);
    }
  };

  useEffect(() => {
    if (authLoading) {
      setLoadingTasks(true);
      return;
    }

    const userId = user?.uid;

    if (!userId) {
      setTodos([]);
      setLoadingTasks(false);
      setTasksError("Necesitas iniciar sesión para ver tus tareas.");
      return;
    }

    setLoadingTasks(true);
    setTasksError(null);

    const unsubscribe = getTasks(
      userId,
      (tasksData) => {
        setTodos(tasksData);
        setLoadingTasks(false);
        setTasksError(null);
      },
      (error) => {
        setTasksError("No se pudieron cargar las tareas. Inténtalo de nuevo.");
        setLoadingTasks(false);
        showToastError("Error de conexión", new Error("No se pudieron cargar las tareas. Por favor, verifica tu conexión a internet."));
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user, authLoading, showToastError]);

  if (loadingTasks) {
    return (
      <Center
        p={4}
        bg={colorMode === "light" ? "white" : "black"}
        borderRadius={themeOptions.borderRadius}
        minH="200px"
        border="2px solid var(--chakra-colors-chakra-border-color)"
        flexDirection="column"
        gap={2}
      >
        <Spinner
          size="lg"
          thickness="4px"
          emptyColor="gray.200"
          color={`${themeOptions.focusColor}.500`}
        />
        <Text size="lg">Cargando...</Text>
      </Center>
    );
  }

  if (tasksError) {
    return (
      <Center
        p={4}
        bg={colorMode === "light" ? "white" : "black"}
        borderRadius={themeOptions.borderRadius}
        minH="200px"
        border="2px solid var(--chakra-colors-chakra-border-color)"
      >
        <Text size="lg" fontWeight={600} color="red.400">
          {tasksError}
        </Text>
      </Center>
    );
  }

  return (
    <Box
      p={4}
      borderRadius={themeOptions.borderRadius}
      bg={colorMode === "light" ? "white" : "black"}
      border="2px solid var(--chakra-colors-chakra-border-color)"
    >
      <HStack
        pb={2}
        alignItems="center"
        justifyContent="flex-start"
        spacing={2}
      >
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
          <Box
            py={10}
            w="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              p={2}
              color={colorMode === "light" ? "#00000060" : "#FFFFFF60"}
            >
              Sin tareas que mostrar
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default TodoList;
