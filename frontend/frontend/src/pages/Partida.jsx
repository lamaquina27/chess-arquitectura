import { useState } from "react"
import { useEffect } from "react"
import "./Partida.css"
import Button from "../components/Button"

function Partida() {
    const [infoPartida, setInfoPartida] = useState(null)
    const [celdaSeleccionada, setCeldaSeleccionada] = useState(null) // Para la celda origen: {fila, columna}

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

    const manejarClickCelda = (i, j, celda) => {
        // Fase 1: Seleccionar origen
        if (!celdaSeleccionada) {
            // Solo seleccionamos si hay una pieza en la celda
            if (celda !== "") {
                setCeldaSeleccionada({ fila: i, columna: j })
            }
        } 
        // Fase 2: Seleccionar destino o deseleccionar
        else {
            const { fila: from_row, columna: from_col } = celdaSeleccionada
            
            // Si hace clic en la misma celda, deseleccionamos
            if (from_row === i && from_col === j) {
                setCeldaSeleccionada(null)
                return
            }

            // Hace clic en otro lado, enviamos movimiento
            enviarMovimientoAPI(from_row, from_col, i, j)
        }
    }

    const enviarMovimientoAPI = (from_row, from_col, to_row, to_col) => {
        fetch("http://localhost:8000/partida/mover", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from_row,
                from_col,
                to_row,
                to_col
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error del servidor:", data.error)
            } else {
                console.log("Movimiento realizado:", data)
                // Actualizamos la información mostrada conservando los jugadores
                setInfoPartida(prev => ({
                    ...prev,
                    turno: data.turno,
                    tablero: data.tablero
                }))
            }
        })
        .catch(error => console.error("Error al mover pieza:", error))
        .finally(() => {
            // Limpiamos la selección una vez enviado (o fallado)
            setCeldaSeleccionada(null)
        })
    }

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

                        // Determinamos si es la celda seleccionada
                        const isSeleccionada = celdaSeleccionada?.fila === i && celdaSeleccionada?.columna === j;
                        const claseSeleccionada = isSeleccionada ? "celda-seleccionada" : "";

                        return (
                            <div 
                                key={`${i}-${j}`} 
                                className={`celda ${colorClase} ${clasePieza} ${claseSeleccionada}`}
                                onClick={() => manejarClickCelda(i, j, celda)}
                            >
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