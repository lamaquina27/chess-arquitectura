import { iniciarPartida } from "../api/iniciar_partida";
import { useNavigate } from "react-router-dom";



function Button() {
    const navigate = useNavigate()
    const iniciarP = async () => {
    try {
    
        
        const data = await iniciarPartida();
        console.log("partida")
        navigate("/partida")
        

    } catch (error) {
        console.error("Error llamando API:", error);
    }
    
    };
  return (
    
          <button className='iniciar' onClick={iniciarP} >
          Inicia Partida
          </button>
    
  )
}

export default Button
