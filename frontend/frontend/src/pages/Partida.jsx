import { useState } from "react"
import { useEffect } from "react"
import "./Partida.css"

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
                {/* 5. Por ahora mostramos los datos del tablero que vienen del backend */}
                {infoPartida.tablero.map((fila, i) => (
                    fila.map((celda, j) => (
                        <div key={j} className="celda">
                            {celda === 0 ? "" : celda}
                        </div>
                    ))
                ))}
            </div>
        </div>
    )
}
export default Partida