import { useState } from "react"
import { useEffect } from "react"
import { moverPieza } from "../api/mover_pieza"
import { iniciarPartida } from "../api/iniciar_partida"
import "./Partida.css"
import Button from "../components/Button"

// Tablero inicial en notación algebraica
const COLUMNAS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const FILAS = ['8', '7', '6', '5', '4', '3', '2', '1']

function crearTableroInicial() {
    const tablero = {}

    // Piezas negras (minúsculas) - filas 8 y 7
    const piezasNegras = ['t', 'c', 'a', 'd', 'r', 'a', 'c', 't']
    COLUMNAS.forEach((col, i) => {
        tablero[col + '8'] = piezasNegras[i]
        tablero[col + '7'] = 'p'
    })

    // Casillas vacías - filas 6 a 3
    for (let fila = 6; fila >= 3; fila--) {
        COLUMNAS.forEach(col => {
            tablero[col + fila] = ''
        })
    }

    // Piezas blancas (mayúsculas) - filas 2 y 1
    const piezasBlancas = ['T', 'C', 'A', 'D', 'R', 'A', 'C', 'T']
    COLUMNAS.forEach((col, i) => {
        tablero[col + '2'] = 'P'
        tablero[col + '1'] = piezasBlancas[i]
    })

    return tablero
}

function Partida() {
    const [infoPartida, setInfoPartida] = useState(null)
    const [tablero, setTablero] = useState(() => crearTableroInicial())
    const [celdaSeleccionada, setCeldaSeleccionada] = useState(null) // Casilla algebraica: "e2"
    const[turno,setTurno]=useState("")
    useEffect(() => {
        //Estado para inciiar la partida
        iniciarPartida().then(data=>{
            setInfoPartida(data)
            setTurno(data.turno)
            
        })
    }, [])

    if (!infoPartida) return <div className="loading">Cargando partida...</div>

    const manejarClickCelda = (casilla) => {
        const pieza = tablero[casilla]

        // Fase 1: Seleccionar origen
        if (!celdaSeleccionada) {
            if (pieza !== '') {
                setCeldaSeleccionada(casilla)
            }
        }
        // Fase 2: Seleccionar destino o deseleccionar
        else {
            // Si hace clic en la misma celda, deseleccionamos
            if (celdaSeleccionada === casilla) {
                setCeldaSeleccionada(null)
                return
            }

            // Obtener la pieza que se mueve
            const piezaMovida = tablero[celdaSeleccionada]

            // Mover la pieza localmente en el tablero
            setTablero(prev => {
                const nuevo = { ...prev }
                nuevo[casilla] = piezaMovida
                nuevo[celdaSeleccionada] = ''
                return nuevo
            })

            // Enviar movimiento al backend
            moverPieza(celdaSeleccionada, casilla, piezaMovida)
            setTurno(turno === "blanco" ? "negro" : "blanco")
            setCeldaSeleccionada(null)
        }
    }

    

    // Símbolos Unicode para las piezas
    const piezasDict = {
        'R': '♚', 'D': '♛', 'T': '♜', 'A': '♝', 'C': '♞', 'P': '♟',
        'r': '♚', 'd': '♛', 't': '♜', 'a': '♝', 'c': '♞', 'p': '♟',
        '': ''
    }

    return (
        <div className="partida-container">
            <h1>Partida de Ajedrez</h1>

            <div className="info-panel">
                <p>⚪ <b>Blancas:</b> {infoPartida.jugador_blanco}</p>
                <p>⚫ <b>Negras:</b> {infoPartida.jugador_negro}</p>
                <p className="turno">Turno actual: <b>{turno}</b></p>
            </div>

            <div className="tablero-wrapper">
                {/* Números de fila (8 a 1) a la izquierda */}
                <div className="coordenadas-filas">
                    {FILAS.map(fila => (
                        <div key={fila} className="coordenada-fila">{fila}</div>
                    ))}
                </div>

                <div className="tablero-inner">
                    {/* Tablero */}
                    <div className="tablero">
                        {FILAS.map((fila, filaIdx) =>
                            COLUMNAS.map((col, colIdx) => {
                                const casilla = col + fila
                                const celda = tablero[casilla]
                                const isClara = (filaIdx + colIdx) % 2 === 0
                                const colorClase = isClara ? "celda-clara" : "celda-oscura"

                                const esBlanca = celda !== '' && celda === celda.toUpperCase()
                                const clasePieza = celda !== '' ? (esBlanca ? "pieza-negra" : "pieza-blanca") : ""

                                const isSeleccionada = celdaSeleccionada === casilla
                                const claseSeleccionada = isSeleccionada ? "celda-seleccionada" : ""

                                return (
                                    <div
                                        key={casilla}
                                        className={`celda ${colorClase} ${clasePieza} ${claseSeleccionada}`}
                                        onClick={() => manejarClickCelda(casilla)}
                                        title={casilla}
                                    >
                                        {piezasDict[celda] || ""}
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Letras de columna (a-h) abajo */}
                    <div className="coordenadas-columnas">
                        {COLUMNAS.map(col => (
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