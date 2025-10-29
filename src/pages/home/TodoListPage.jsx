import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext/ThemeContext";
import { useAuthUser } from "../../context/AuthUserContext/AuthUserContext";
import {
  Box,
  useColorMode,
  Text,
  VStack,
  Checkbox,
  IconButton,
  HStack,
  Spinner,
  useToast,
  Center,
  Stack,
  Input,
} from "@chakra-ui/react";
import {
  subscribeToTasks,
  addTask,
  updateTask,
  deleteTask,
} from "../../hooks/useDatabase";
import * as LuIcons from "react-icons/lu";

const TodoListPage = () => {
  const { user, loading: authLoading } = useAuthUser();
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  const showToast = useCallback(
    (title, description = "", status) => {
      toast({
        title: <Text fontWeight={600}>{title}</Text>,
        description: description,
        status,
        position: "bottom",
      });
    },
    [toast]
  );

  const showToastError = useCallback(
    (title, error) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      showToast(
        title,
        errorMessage || "Ha ocurrido un error inesperado.",
        "error"
      );
    },
    [showToast]
  );

  const showToastSuccess = useCallback(
    (title, description = "") => {
      showToast(title, description, "success");
    },
    [showToast]
  );

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!user?.uid) {
      showToastError(
        "Error al añadir una tarea",
        new Error("Usuario no autenticado.")
      );
      return;
    }

    if (newTask.trim() === "") {
      showToastError("Entrada inválida", "La entrada está vacía.");
      return;
    }

    try {
      await addTask(newTask.trim(), user.uid);
      setNewTask("");
      showToastSuccess(
        "Tarea añadida",
        "La tarea se ha añadido correctamente."
      );
    } catch (err) {
      showToastError("Error al añadir la tarea", err);
    }
  };

  const handleToggleComplete = useCallback(
    async (id, isCompleted) => {
      if (!user?.uid) {
        showToastError(
          "Error de autenticación",
          "Debes iniciar sesión para actualizar tareas."
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
    },
    [user, showToastError, showToastSuccess]
  );

  const handleDeleteTask = useCallback(
    async (id) => {
      if (!user?.uid) {
        showToastError(
          "Error de autenticación",
          "Debes iniciar sesión para eliminar tareas."
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
    },
    [user, showToastError, showToastSuccess]
  );

  useEffect(() => {
    if (authLoading || !user?.uid) {
      setTodos([]);
      setLoadingTasks(false);
      setTasksError("Necesitas iniciar sesión para ver tus tareas.");
      return;
    }

    setLoadingTasks(true);
    setTasksError(null);

    const unsubscribe = subscribeToTasks(
      user.uid,
      (tasksData) => {
        setTodos(tasksData);
        setLoadingTasks(false);
        setTasksError(null);
      },
      (error) => {
        setTasksError("No se pudieron cargar las tareas. Inténtalo de nuevo.");
        setLoadingTasks(false);
        showToastError(
          "Error de conexión",
          new Error(
            "No se pudieron cargar las tareas. Por favor, verifica tu conexión a internet."
          )
        );
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
        border="2px solid var(--chakra-colors-chakra-border-color)"
        flexDirection="column"
        gap={2}
      >
        <Spinner
          size="lg"
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
      position="relative"
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
        <Text fontSize="xl" fontWeight={600}>
          Lista de tareas
        </Text>
      </HStack>
      <VStack spacing={0} alignItems="flex-start">
        <HStack
          as="form"
          px={1}
          onSubmit={handleAddTask}
          w="100%"
          h="2.5rem"
          borderWidth={1}
          borderRadius={themeOptions.borderRadius}
          _focusWithin={{
            borderColor: `var(--chakra-colors-${themeOptions.focusColor}-300)`,
          }}
        >
          <IconButton
            type="submit"
            icon={<LuIcons.LuPlus size="16px" />}
            aria-label="Añadir tarea"
            variant="ghost"
            size="sm"
            _focusVisible={{ outline: "none" }}
          />
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Crear nueva tarea"
            variant="unstyled"
            h="100%"
            _focusVisible={{ outline: "none" }}
          />
        </HStack>
        <Stack
          w="full"
          h={{ base: "auto", md: "317px" }}
          gap={1}
          overflowY="auto"
        >
          {todos.map((todo) => (
            <HStack
              key={todo.id}
              w="full"
              alignItems="center"
              justifyContent="space-between"
              _hover={{
                "& .trash-button": {
                  visibility: "visible",
                },
              }}
            >
              <Checkbox
                p={2}
                colorScheme={themeOptions.focusColor}
                isChecked={todo.completed}
                onChange={() => handleToggleComplete(todo.id, todo.completed)}
                flexGrow={1}
              >
                <Text textDecoration={todo.completed ? "line-through" : "none"}>
                  {todo.text}
                </Text>
              </Checkbox>
              <IconButton
                className="trash-button"
                aria-label={`Borrar tarea ${todo.text}`}
                icon={<LuIcons.LuTrash />}
                size="sm"
                variant="unstyled"
                colorScheme="blackAlpha"
                onClick={() => handleDeleteTask(todo.id)}
                visibility="hidden"
                _focusVisible={{ outline: "none" }}
              />
            </HStack>
          ))}
          {todos.length === 0 && (
            <Center py={10} w="100%">
              <Text
                p={2}
                color={colorMode === "light" ? "#00000060" : "#FFFFFF60"}
              >
                Sin tareas que mostrar.
              </Text>
            </Center>
          )}
        </Stack>
      </VStack>
    </Box>
  );
};

export default TodoListPage;
