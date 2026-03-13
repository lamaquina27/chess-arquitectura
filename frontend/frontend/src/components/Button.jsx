import { iniciarPartida } from "../api/iniciar_partida";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Button.css"
import PopupConfirmacion from "./PopupConfirmacion.jsx";


function Button(props) {
    const navigate = useNavigate()
    const [usePopup,setUsePopup] = useState(false)
    let texto = props.funcion == "iniciar" ? "Inicia Partida" : "Abandonar Partida"
    const metodos = async () => {
    
        if(props.funcion == "iniciar"){
            
            navigate("/partida")
            
        }else if(props.funcion=="abandonar"){
            setUsePopup(true)
        }
        


    
    };
  return (
    <>
        <button  onClick={metodos} className="boton">
            {texto}
        </button>
        {usePopup && <PopupConfirmacion cerrar={()=>setUsePopup(false)}/>}
    </>
    
  )
}

export default Button
