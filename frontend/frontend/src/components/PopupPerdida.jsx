import "./PopupPerdida.css"
import { useNavigate } from "react-router-dom";

function PopupPerdida(){
    const navigate = useNavigate()
    const metodos = async () => {
        navigate("/inicio")
    };
    return(
        <>
            <div className="popup-overlay">
                <div className="popup">
                    <h2>Que triste perdiste!</h2>

                    <div className="botones">
                        <button  className="boton" onClick={metodos}> Volver a home</button>
                    </div>

                </div>
                </div>
        </>
    )

}

export default PopupPerdida