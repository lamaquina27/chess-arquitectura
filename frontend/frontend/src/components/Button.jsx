import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Button.css"
import PopupTipoPartida from "./PopupTipoPartida.jsx";
import PopupConfirmacion from "./PopupConfirmacion.jsx";


function Button(props) {
    const navigate = useNavigate()
    const [usePopup, setUsePopup] = useState(false)
    const [showInicioPopup, setShowInicioPopup] = useState(false);
    let texto = "";
    if (props.funcion == "iniciar") texto = "Inicia Partida";
    else if (props.funcion == "abandonar") texto = "Abandonar Partida";
    else if (props.funcion == "perfil") texto = "Ver Perfil";
    else if (props.funcion == "cerrar_sesion") texto = "Cerrar Sesión";

    const metodos = async () => {
        if (props.funcion == "iniciar") {
            // Ya no viajamos al tablero directamente, encendemos el menú flotante
            setShowInicioPopup(true);

        } else if (props.funcion == "abandonar") {
            setUsePopup(true);

        } else if (props.funcion == "perfil") {
            navigate("/perfil");
        } else if (props.funcion == "cerrar_sesion") {
            // 1. Borrar la identificación del navegador
            localStorage.removeItem("token");
            // 2. Regresar a la página principal de registro/sesión
            navigate("/");
        }

    };

    return (
        <>
            <button onClick={metodos} className="boton">
                {texto}
            </button>
            {usePopup && <PopupConfirmacion cerrar={() => setUsePopup(false)} idPartida={props.idPartida} />}

            {/* Aquí agregamos el nuevo popup */}
            {showInicioPopup && <PopupTipoPartida cerrar={() => setShowInicioPopup(false)} />}
        </>
    )

}

export default Button
