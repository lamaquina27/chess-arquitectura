
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Partida from "./pages/Partida.jsx";
import Home from "./pages/Home.jsx";
import Sesion from './pages/Sesion.jsx';
import Registro from './pages/registro.jsx';
import Perfil from "./pages/Perfil.jsx";
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Sesion />} />
        <Route path='/inicio' element={<Home />} />
        <Route path='/registro-usuario' element={<Registro />} />
        <Route path="/partida" element={<Partida />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App