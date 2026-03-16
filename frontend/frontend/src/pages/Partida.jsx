import { useState } from "react"
import { useEffect } from "react"
import "./Partida.css"
import Button from "../components/Button"

function Partida() {
    const [infoPartida, setInfoPartida] = useState(null)

    useEffect(() => {
        fetch("http://localhost:8000/partida/iniciar", {
            method: "POST"
        })
            .then(response => response.json())
            .then(data => {
                console.log("Datos recibidos:", data)
                setInfoPartida(data)
            })
            .catch(error => console.error("Error al conectar con el backend:", error))
    }, [])

    if (!infoPartida) return <div className="loading">Cargando partida...</div>

    // Usamos los símbolos "rellenos" para ambos colores.
    // Diferenciaremos a las blancas de las negras usando colores en el CSS.
    const piezasDict = {
        'R': '♚', 'D': '♛', 'T': '♜', 'A': '♝', 'C': '♞', 'P': '♟',
        'r': '♚', 'd': '♛', 't': '♜', 'a': '♝', 'c': '♞', 'p': '♟',
        '': ''
    };

    return (
        <div className="partida-container">
            <h1>Partida de Ajedrez</h1>

            {/* 4. Mostramos la info de los jugadores y de quién es el turno */}
            <div className="info-panel">
                <p>⚪ <b>Blancas:</b> {infoPartida.jugador_blanco}</p>
                <p>⚫ <b>Negras:</b> {infoPartida.jugador_negro}</p>
                <p className="turno">Turno actual: <b>{infoPartida.turno}</b></p>
            </div>
            <div className="tablero">
                {/* 5. Renderizado del tablero con colores alternados y caracteres Unicode */}
                {infoPartida.tablero.map((fila, i) => (
                    fila.map((celda, j) => {
                        const isClara = (i + j) % 2 === 0;
                        const colorClase = isClara ? "celda-clara" : "celda-oscura";

                        // Determinamos si la pieza es blanca verificando si la letra es mayúscula
                        const esBlanca = celda !== "" && celda === celda.toUpperCase();
                        const clasePieza = celda !== "" ? (esBlanca ? "pieza-negra" : "pieza-blanca") : "";

                        return (
                            <div key={`${i}-${j}`} className={`celda ${colorClase} ${clasePieza}`}>
                                {piezasDict[celda] || ""}
                            </div>
                        );
                    })
                ))}
            </div>
            <div className="opciones">
                <Button funcion='abandonar'></Button>
            </div>
        </div>
    )
}
export default Partida