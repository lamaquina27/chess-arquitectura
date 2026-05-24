import "./PopupPerdida.css"
import { useNavigate } from "react-router-dom";

const MENSAJES = {
    jaque_mate:       { titulo: "¡Jaque mate!",          desc: "El rey no tiene escapatoria. La partida ha terminado." },
    abandono:         { titulo: "Partida abandonada",     desc: "Has abandonado la partida." },
    victoria_abandono:{ titulo: "¡Has ganado!",           desc: "Tu oponente ha abandonado la partida. ¡Eres el ganador!" },
    ahogado:          { titulo: "¡Tablas!",               desc: "No hay movimientos posibles. La partida termina en tablas." },
    victoria_tiempo:  { titulo: "¡Has ganado!",           desc: "Tu rival se quedó sin tiempo. ¡Eres el ganador!" },
    derrota_tiempo:   { titulo: "Tiempo agotado",         desc: "Se te acabó el tiempo. Has perdido la partida." },
    timeout:          { titulo: "Tiempo agotado",         desc: "El tiempo de la partida ha finalizado." },
};

function PopupPerdida({ motivo }) {
    const navigate = useNavigate()
    const { titulo, desc } = MENSAJES[motivo] || { titulo: "Partida terminada", desc: "" }

    return (
        <div className="popup-overlay">
            <div className="popup">
                <h2>{titulo}</h2>
                <p className="popup-descripcion">{desc}</p>
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
