import { useState } from "react"
import { useEffect } from "react"
import "./Partida.css"
import Button from "../components/Button"
import { moverPieza } from "../api/mover_pieza"

// Estado inicial del tablero con notación algebraica
const COLUMNAS = ["a", "b", "c", "d", "e", "f", "g", "h"]
const FILAS = [8, 7, 6, 5, 4, 3, 2, 1]

function crearTableroInicial() {
    const tablero = {}

    // Piezas negras (mayúsculas)
    const piezasNegras = ["T", "C", "A", "D", "R", "A", "C", "T"]
    COLUMNAS.forEach((col, i) => {
        tablero[col + "8"] = piezasNegras[i]
        tablero[col + "7"] = "P"
    })

    // Casillas vacías
    for (let fila = 6; fila >= 3; fila--) {
        COLUMNAS.forEach((col) => {
            tablero[col + fila] = ""
        })
    }

    // Piezas blancas (minúsculas)
    const piezasBlancas = ["t", "c", "a", "d", "r", "a", "c", "t"]
    COLUMNAS.forEach((col, i) => {
        tablero[col + "2"] = "p"
        tablero[col + "1"] = piezasBlancas[i]
    })

    return tablero
}

// Mapa de piezas a emojis (símbolos sólidos para ambos colores)
const PIEZAS_EMOJI = {
    "T": "♜", "C": "♞", "A": "♝", "D": "♛", "R": "♚", "P": "♟",
    "t": "♜", "c": "♞", "a": "♝", "d": "♛", "r": "♚", "p": "♟",
}

const esPiezaBlanca = (pieza) => pieza === pieza.toLowerCase() && pieza !== ""

function Partida() {
    const [infoPartida, setInfoPartida] = useState(null)
    const [tablero, setTablero] = useState(crearTableroInicial())
    const [celdaSeleccionada, setCeldaSeleccionada] = useState(null)
    const [turno, setTurno] = useState("blanco")

    useEffect(() => {
        fetch("http://localhost:8000/partida/iniciar", {
            method: "POST"
        })
            .then(response => response.json())
            .then(data => {
                console.log("Datos recibidos:", data)
                setInfoPartida(data)
                setTurno(data.turno)
            })
            .catch(error => console.error("Error al conectar con el backend:", error))
    }, [])

    const handleClickCelda = async (casilla) => {
        const pieza = tablero[casilla]

        if (!celdaSeleccionada) {
            // Seleccionar una pieza
            if (pieza !== "") {
                setCeldaSeleccionada(casilla)
            }
        } else {
            if (casilla === celdaSeleccionada) {
                // Deseleccionar
                setCeldaSeleccionada(null)
                return
            }

            // Mover la pieza
            const piezaOrigen = tablero[celdaSeleccionada]
            const nuevoTablero = { ...tablero }
            nuevoTablero[casilla] = piezaOrigen
            nuevoTablero[celdaSeleccionada] = ""
            setTablero(nuevoTablero)

            // Enviar al backend
            try {
                const resultado = await moverPieza(celdaSeleccionada, casilla, piezaOrigen)
                if (resultado.turno) {
                    setTurno(resultado.turno)
                }
            } catch (error) {
                console.error("Error al enviar movimiento:", error)
            }

            setCeldaSeleccionada(null)
        }
    }

    if (!infoPartida) return <div className="loading">Cargando partida...</div>

    return (
        <div className="partida-container">
            <h1>Partida de Ajedrez</h1>

            <div className="info-panel">
                <p>⚪ <b>Blancas:</b> {infoPartida.jugador_blanco}</p>
                <p>⚫ <b>Negras:</b> {infoPartida.jugador_negro}</p>
                <p className="turno">Turno actual: <b>{turno}</b></p>
            </div>

            <div className="tablero-wrapper">
                {/* Números de fila (8-1) a la izquierda */}
                <div className="coordenadas-filas">
                    {FILAS.map((fila) => (
                        <div key={fila} className="coordenada-fila">{fila}</div>
                    ))}
                </div>

                <div className="tablero-interior">
                    <div className="tablero">
                        {FILAS.map((fila) =>
                            COLUMNAS.map((col) => {
                                const casilla = col + fila
                                const pieza = tablero[casilla]
                                const esSeleccionada = celdaSeleccionada === casilla
                                const esClara = (COLUMNAS.indexOf(col) + fila) % 2 === 1

                                return (
                                    <div
                                        key={casilla}
                                        className={`celda ${esClara ? "celda-clara" : "celda-oscura"} ${esSeleccionada ? "celda-seleccionada" : ""}`}
                                        onClick={() => handleClickCelda(casilla)}
                                        title={casilla}
                                    >
                                        {pieza ? (
                                            <span className={`pieza ${esPiezaBlanca(pieza) ? "pieza-blanca" : "pieza-negra"}`}>
                                                {PIEZAS_EMOJI[pieza] || pieza}
                                            </span>
                                        ) : ""}
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Letras de columna (a-h) abajo */}
                    <div className="coordenadas-columnas">
                        {COLUMNAS.map((col) => (
                            <div key={col} className="coordenada-col">{col}</div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="opciones">
                <Button funcion='abandonar'></Button>
            </div>
        </div>
    )
}
export default Partida