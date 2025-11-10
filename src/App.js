import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "./App/AppRoutes";
import "./styles/index.css";

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;