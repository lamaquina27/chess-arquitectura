
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Partida from "./pages/Partida.jsx";
import Home from "./pages/Home.jsx";
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/partida" element={<Partida />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App