import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Button.css"
import PopupConfirmacion from "./PopupConfirmacion.jsx";


function Button(props) {
    const navigate = useNavigate()
    const [usePopup, setUsePopup] = useState(false)
    let texto = "";
    if (props.funcion == "iniciar") texto = "Inicia Partida";
    else if (props.funcion == "abandonar") texto = "Abandonar Partida";
    else if (props.funcion == "perfil") texto = "Ver Perfil";

    const metodos = async () => {

        if (props.funcion == "iniciar") {

            navigate("/partida")

        } else if (props.funcion == "abandonar") {
            setUsePopup(true)

        } else if (props.funcion == "perfil") {
            navigate("/perfil");
        }





    };
    return (
        <>
            <button onClick={metodos} className="boton">
                {texto}
            </button>
            {usePopup && <PopupConfirmacion cerrar={() => setUsePopup(false)} idPartida={props.idPartida} />}
        </>

    )
}

export default Button
