import "./PopupPerdida.css"
import { useNavigate } from "react-router-dom";

function PopupPerdida({ motivo }) {
    const navigate = useNavigate()

    const titulo = motivo === "jaque_mate" ? "¡Jaque mate!"
               : motivo === "abandono"   ? "Partida abandonada"
               : "¡Tablas!"

    const descripcion = motivo === "jaque_mate"
        ? "El rey no tiene escapatoria. La partida ha terminado."
        : motivo === "abandono"
        ? "Has abandonado la partida."
        : "No hay movimientos posibles. La partida termina en tablas."

    return (
        <div className="popup-overlay">
            <div className="popup">
                <h2>{titulo}</h2>
                <p className="popup-descripcion">{descripcion}</p>
                <div className="botones">
                    <button className="boton" onClick={() => navigate("/inicio")}>
                        Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PopupPerdida