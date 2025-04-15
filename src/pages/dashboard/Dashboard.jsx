import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getAreas as getAreasFromDb,
  getHabitsByArea as getHabitsByAreaFromDb,
} from "../../hooks/database";
import {
  AllAreas,
  AllHabits,
  AreaPage,
  HabitPage,
  LeftColumn,
} from "../../routes/index";
import customTheme from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import {
  VStack,
  Text,
  ChakraProvider,
  useToast,
  useColorMode,
  SimpleGrid,
  Skeleton,
} from "@chakra-ui/react";

const Dashboard = () => {
  // Basic configuration
  const { themeOptions } = useTheme();
  const { colorMode } = useColorMode();
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Areas & Habits states
  const [areas, setAreas] = useState([]);
  const { areaId } = useParams();
  const [selectedHabit, setSelectedHabit] = useState(null);

  // Resizing columns
  const containerRef = useRef(null);
  const col1Ref = useRef(null);
  const col2Ref = useRef(null);
  const col3Ref = useRef(null);
  const resizer1Ref = useRef(null);
  const resizer2Ref = useRef(null);
  const [content, setContent] = useState(null);

  /**
   * Redirects to the all-habits page if the user navigates directly to the dashboard root.
   */
  useEffect(() => {
    if (
      location.pathname === "/dashboard" ||
      location.pathname === "/dashboard/"
    ) {
      navigate("/dashboard/all-habits");
    }
  }, [location, navigate]);

  /**
   * Fetches the user's areas from Firestore using the `getAreasFromDb` function.
   * It sets up a real-time listener to update the `areas` state whenever the data changes.
   * @function fetchAreas
   * @returns {Function|void} - Returns the unsubscribe function for the Firestore listener, or void if no user is logged in.
   */
  const fetchAreas = useCallback(async () => {
    if (!user) return () => {};

    try {
      const unsubscribe = getAreasFromDb((areasList) => {
        setAreas(areasList);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error fetching areas: ", error);
      return () => {};
    }
  }, [user]);

  /**
   * Fetches habits for a specific area using the `getHabitsByAreaFromDb` function.
   * @async
   * @function fetchHabits
   * @param {string} areaId - The ID of the area to fetch habits from.
   * @returns {Promise<Array<object>>} - A promise that resolves to an array of habit objects.
   */
  const fetchHabits = useCallback(
    async (areaId) => {
      if (!user || !areaId) return [];
      try {
        const habitsList = await getHabitsByAreaFromDb(areaId);
        return habitsList;
      } catch (error) {
        console.error(`Error getting habits for area ${areaId}: `, error);
        return [];
      }
    },
    [user]
  );

  /**
   * Handles the resizing logic for the dashboard columns.
   * It allows the user to drag the resizers to adjust the width of the left and right columns.
   */
  useEffect(() => {
    let isResizing = false;
    let activeResizer = null;
    let startX = 0;
    let initialWidths = {};

    const handleMouseDown = (e, resizer) => {
      isResizing = true;
      activeResizer = resizer;
      startX = e.clientX;

      const containerWidth = containerRef.current.offsetWidth;
      initialWidths = {
        col1: (col1Ref.current.offsetWidth / containerWidth) * 100,
        col2: (col2Ref.current.offsetWidth / containerWidth) * 100,
        col3: (col3Ref.current.offsetWidth / containerWidth) * 100,
        container: containerWidth,
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (!isResizing || !activeResizer) return;

      const deltaX = e.clientX - startX;
      const { col1, col3, container } = initialWidths;

      if (activeResizer === resizer1Ref.current) {
        let newCol1Width = col1 + (deltaX / container) * 100;
        newCol1Width = Math.max(13, Math.min(newCol1Width, 16));

        const newCol2Width = 100 - newCol1Width - col3;

        col1Ref.current.style.width = `${newCol1Width}%`;
        col2Ref.current.style.width = `${newCol2Width}%`;
      } else if (activeResizer === resizer2Ref.current) {
        let newCol3Width = col3 - (deltaX / container) * 100;
        newCol3Width = Math.max(20, Math.min(newCol3Width, 50));

        const newCol2Width = 100 - col1 - newCol3Width;

        col3Ref.current.style.width = `${newCol3Width}%`;
        col2Ref.current.style.width = `${newCol2Width}%`;
      }
    };

    const handleMouseUp = () => {
      isResizing = false;
      activeResizer = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const resizer1 = resizer1Ref.current;
    const resizer2 = resizer2Ref.current;

    if (resizer1) {
      resizer1.addEventListener("mousedown", (e) =>
        handleMouseDown(e, resizer1)
      );
    }
    if (resizer2) {
      resizer2.addEventListener("mousedown", (e) =>
        handleMouseDown(e, resizer2)
      );
    }

    return () => {
      if (resizer1) {
        resizer1.removeEventListener("mousedown", handleMouseDown);
      }
      if (resizer2) {
        resizer2.removeEventListener("mousedown", handleMouseDown);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  /**
   * Sets the main content area based on the current URL path.
   * It renders different components for all habits, all areas, and specific area pages.
   */
  useEffect(() => {
    if (areaId) {
      setContent(
        <AreaPage areas={areas} setSelectedHabit={setSelectedHabit} />
      );
    } else {
      switch (location.pathname) {
        case "/dashboard/all-habits":
          setContent(<AllHabits setSelectedHabit={setSelectedHabit} />);
          break;
        case "/dashboard/all-areas":
          setContent(<AllAreas />);
          break;
        default:
          setContent(<AllHabits setSelectedHabit={setSelectedHabit} />);
      }
    }
  }, [location.pathname, areaId, areas, setSelectedHabit]);

  /**
   * Fetches the initial areas data when the component mounts.
   */
  useEffect(() => {
    const unsubscribe = fetchAreas();
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [fetchAreas]);

  return (
    <ChakraProvider
      theme={customTheme(
        themeOptions.focusColor,
        themeOptions.fontFamily,
        themeOptions.borderRadius
      )}
    >
      <div id="dashboard" ref={containerRef}>
        <div ref={col1Ref} className="column" id="col1">
          {user ? <LeftColumn userInfo={user} /> : null}
        </div>
        <div ref={resizer1Ref} className="resizer" id="resizer1"></div>
        <div ref={col2Ref} className="column" id="col2">
          {content}
        </div>
        <div ref={resizer2Ref} className="resizer" id="resizer2"></div>
        <div ref={col3Ref} className="column" id="col3" style={{ flex: 3 }}>
          {selectedHabit ? (
            <HabitPage habit={selectedHabit} />
          ) : (
            <VStack
              w="100%"
              h="100vh"
              p={4}
              spacing={2}
              textAlign="center"
              justifyContent="center"
              bg={
                colorMode === "light" ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)"
              }
            >
              <SimpleGrid mb={4} columns={2} rows={2} spacing={2}>
                <Skeleton
                  w="50px"
                  h="50px"
                  borderRadius={themeOptions.borderRadius}
                ></Skeleton>
                <Skeleton
                  w="50px"
                  h="50px"
                  borderRadius={themeOptions.borderRadius}
                ></Skeleton>
                <Skeleton
                  w="50px"
                  h="50px"
                  borderRadius={themeOptions.borderRadius}
                ></Skeleton>
                <Skeleton
                  w="50px"
                  h="50px"
                  borderRadius={themeOptions.borderRadius}
                ></Skeleton>
              </SimpleGrid>
              <Text as="h2" fontSize="xl" fontWeight="600">
                Selecciona un hábito para visualizar su contenido
              </Text>
              <Text as="p" fontSize="sm" fontWeight="400">
                Para poder ver los progresos e información acerca de un hábito,
                solo selecciona el hábito deseado.
              </Text>
            </VStack>
          )}
        </div>
      </div>
    </ChakraProvider>
  );
};

export default Dashboard;
