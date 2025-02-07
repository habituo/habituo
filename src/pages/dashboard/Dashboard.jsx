import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../../hooks/firebase";
import { AllAreas, AllHabits, AreaPage, HabitPage, LeftColumn } from "../../routes/index";
import customTheme from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import { ChakraProvider } from "@chakra-ui/react";

const Dashboard = () => {
  const { themeOptions } = useTheme();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [areas, setAreas] = useState([]);
  const containerRef = useRef(null);
  const col1Ref = useRef(null);
  const col2Ref = useRef(null);
  const col3Ref = useRef(null);
  const resizer1Ref = useRef(null);
  const resizer2Ref = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { areaId } = useParams();
  const [content, setContent] = useState(null);

  useEffect(() => {
    if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
      navigate("/dashboard/all-habits");
    }
  }, [location, navigate]);

  const fetchAreas = async () => {
    if (!user) return;

    try {
      const areasRef = collection(db, "users", user.uid, "areas");

      const unsubscribe = onSnapshot(areasRef, (snapshot) => {
        const areasList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAreas(areasList);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error al obtener las áreas: ", error);
      setLoading(false);
    }
  };

    // Función para obtener los hábitos de Firestore por área
    const fetchHabits = async (areaId) => {
      try {
        const querySnapshot = await getDocs(collection(db, `users/${user.uid}/areas/${areaId}/habits`));
        const habitsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return habitsList;
      } catch (error) {
        console.error("Error getting habits: ", error);
        return [];
      }
    };

  useEffect(() => {
    fetchAreas();
  }, [user]);

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

    resizer1Ref.current.addEventListener("mousedown", (e) =>
      handleMouseDown(e, resizer1Ref.current)
    );
    resizer2Ref.current.addEventListener("mousedown", (e) =>
      handleMouseDown(e, resizer2Ref.current)
    );

    return () => {
      resizer1Ref.current?.removeEventListener("mousedown", handleMouseDown);
      resizer2Ref.current?.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (areaId) {
      setContent(<AreaPage areas={areas} fetchHabits={fetchHabits} areaId={areaId} />);
    } else {
      switch (true) {
        case location.pathname === '/dashboard/all-habits':
          setContent(<AllHabits />);
          break;
        case location.pathname === '/dashboard/all-areas':
          setContent(<AllAreas />);
          break;
        default:
          setContent(<AllHabits />);
      }
    }
  }, [location.pathname, areaId, areas]);
  

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
          <HabitPage />
        </div>
      </div>
    </ChakraProvider>
  );
};

export default Dashboard;
