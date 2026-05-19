import { use, useState, useEffect, useRef } from "react"
import { moverPieza } from "../api/mover_pieza"
import { iniciarPartida } from "../api/iniciar_partida"
import { useNavigate, useLocation } from "react-router-dom";
import { obtenerMovimientos } from "../api/obtener_movimientos"

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
    const [celdaSeleccionada, setCeldaSeleccionada] = useState(null)
    const [casillasValidas, setCasillasValidas] = useState([])
    const [idPartida, setIdPartida] = useState(null)
    const [turno, setTurno] = useState("")
    const [miColor, setMiColor] = useState(null)
    const [esOnline, setEsOnline] = useState(false)
    const ws = useRef(null)
    // Refs para evitar stale closures en manejarClickCelda
    const turnoRef = useRef("")
    const miColorRef = useRef(null)
    const navigate = useNavigate()
    const location = useLocation()
    const [mensaje, setMensaje] = useState("")
    const mensajeTimeoutRef = useRef(null)
    useEffect(() => {
        const cargar = async () => {
            // Averiguamos si venimos del modo Multijugador (el Popup)
            if (location.state && location.state.partidaData) {
                const dataPrecargada = location.state.partidaData;
                setInfoPartida(dataPrecargada);
                setTurno(dataPrecargada.turno);
                setIdPartida(dataPrecargada.id_partida);
                setEsOnline(true);
            } else {
                // Si la mochila viene vacía, arrancamos la Partida Práctica por defecto
                const data = await iniciarPartida();
                if (data.error) {
                    alert("No estás autorizado");
                    navigate("/");
                    return;
                }
                setInfoPartida(data);
                setTurno(data.turno);
                setIdPartida(data.id_partida);
            }
        }
        cargar();
    }, [location.state, navigate]);

    // Sincronizar refs con los estados
    useEffect(() => { turnoRef.current = turno; }, [turno]);
    useEffect(() => { miColorRef.current = miColor; }, [miColor]);

    // Manejar conexión WebSocket para actualizaciones en tiempo real
    useEffect(() => {
        if (!idPartida || !esOnline) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new WebSocket(`${protocol}//${window.location.host}/ws/online/${idPartida}?token=${token}`);
        ws.current = socket;

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.action === "init") {
                setMiColor(data.mi_color);
                miColorRef.current = data.mi_color;
                setTurno(data.turno);
                turnoRef.current = data.turno;
            } else if (data.action === "update_board") {
                if (data.turno) {
                    setTurno(data.turno);
                    turnoRef.current = data.turno;
                }
                if (data.casilla_inicio && data.casilla_llegada) {
                    setTablero(prev => {
                        const nuevo = { ...prev };
                        nuevo[data.casilla_llegada] = data.pieza;
                        nuevo[data.casilla_inicio] = '';
                        return nuevo;
                    });
                }
            } else if (data.error) {
                alert(data.error);
            }
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [idPartida, esOnline]);


    if (!infoPartida) return <div className="loading">Cargando partida...</div>

    const mostrarMensaje = (texto) => {
        if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current)
        setMensaje(texto)
        mensajeTimeoutRef.current = setTimeout(() => setMensaje(""), 2500)
    }

    const manejarClickCelda = async (casilla) => {
        const pieza = tablero[casilla]

        // Fase 1: Seleccionar origen
        if (!celdaSeleccionada) {
            if (pieza !== '') {
                const esMayuscula = pieza === pieza.toUpperCase();
                const colorPieza = esMayuscula ? "blanco" : "negro";

                if (esOnline) {
                    const miColorActual = miColorRef.current;
                    const turnoActual = turnoRef.current;
                    if (miColorActual === "observador") {
                        mostrarMensaje("Solo estás observando la partida.")
                        return;
                    }
                    if (colorPieza !== miColorActual) {
                        mostrarMensaje(`Solo puedes mover tus piezas (${miColorActual}s)`)
                        return;
                    }
                    if (miColorActual !== turnoActual) {
                        mostrarMensaje("Es el turno de tu rival.")
                        return;
                    }
                } else {
                    if (colorPieza !== turno) {
                        mostrarMensaje(`No es tu turno. Turno de las ${turno}s`)
                        return;
                    }
                }
                const validas = await obtenerMovimientos(idPartida, casilla)
                setCasillasValidas(validas)
                setCeldaSeleccionada(casilla)
            }
        }

        // Fase 2: Seleccionar destino o deseleccionar
        else {
            setCasillasValidas([])

            // Si hace clic en la misma celda, deseleccionamos
            if (celdaSeleccionada === casilla) {
                setCeldaSeleccionada(null)
                return
            }

            // Bloquear cualquier destino que no sea válido según el motor de ajedrez
            if (!casillasValidas.includes(casilla)) {
                setCeldaSeleccionada(null)
                return
            }

            // Obtener la pieza que se mueve
            const piezaMovida = tablero[celdaSeleccionada]

            // Enviar movimiento al backend
            if (esOnline && ws.current) {
                // En modo online NO actualizamos el tablero localmente;
                // esperamos el update_board del WS para garantizar sincronismo
                ws.current.send(JSON.stringify({
                    action: "mover",
                    casilla_inicio: celdaSeleccionada,
                    casilla_llegada: casilla,
                    pieza: piezaMovida
                }));
            } else {
                setTablero(prev => {
                    const nuevo = { ...prev }
                    nuevo[casilla] = piezaMovida
                    nuevo[celdaSeleccionada] = ''
                    return nuevo
                })
                moverPieza(celdaSeleccionada, casilla, piezaMovida, idPartida);
                setTurno(turno === "blanco" ? "negro" : "blanco");
            }

            setCeldaSeleccionada(null)
        }
    }



    // Símbolos Unicode para las piezas
    const piezasDict = {
        'R': '♚', 'D': '♛', 'T': '♜', 'A': '♝', 'C': '♞', 'P': '♟',
        'r': '♚', 'd': '♛', 't': '♜', 'a': '♝', 'c': '♞', 'p': '♟',
        '': ''
    }

    // Orientación del tablero
    const filasVisuales = miColor === "negro" ? [...FILAS].reverse() : FILAS;
    const columnasVisuales = miColor === "negro" ? [...COLUMNAS].reverse() : COLUMNAS;

    return (
        <div className="partida-container">
            <h1>Partida de Ajedrez</h1>

            <div className="info-panel">
                <p>⚪ <b>Blancas:</b> {infoPartida.jugador_blanco}</p>
                <p>⚫ <b>Negras:</b> {infoPartida.jugador_negro}</p>
                <p className="turno">Turno actual: <b>{turno}</b></p>
                {mensaje && (
                    <p className="mensaje-juego">{mensaje}</p>
                )}
            </div>

            <div className="tablero-wrapper">
                {/* Números de fila a la izquierda */}
                <div className="coordenadas-filas">
                    {filasVisuales.map(fila => (
                        <div key={fila} className="coordenada-fila">{fila}</div>
                    ))}
                </div>

                <div className="tablero-inner">
                    {/* Tablero */}
                    <div className="tablero">
                        {filasVisuales.map((fila, filaIdx) =>
                            columnasVisuales.map((col, colIdx) => {
                                const casilla = col + fila
                                const celda = tablero[casilla]
                                const isClara = (filaIdx + colIdx) % 2 === 0
                                const colorClase = isClara ? "celda-clara" : "celda-oscura"

                                const esBlanca = celda !== '' && celda === celda.toUpperCase()
                                const clasePieza = celda !== '' ? (esBlanca ? "pieza-blanca" : "pieza-negra") : ""

                                const isSeleccionada = celdaSeleccionada === casilla
                                const claseSeleccionada = isSeleccionada ? "celda-seleccionada" : ""
                                const esPosible = casillasValidas.includes(casilla) && tablero[casilla] === ''
                                const esCaptura = casillasValidas.includes(casilla) && tablero[casilla] !== ''

                                return (
                                    <div
                                        key={casilla}
                                        className={`celda ${colorClase} ${clasePieza} ${claseSeleccionada} ${esPosible ? 'celda-posible' : ''} ${esCaptura ? 'celda-captura' : ''}`}
                                        onClick={() => manejarClickCelda(casilla)}
                                        title={casilla}
                                    >
                                        {piezasDict[celda] || ""}
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Letras de columna abajo */}
                    <div className="coordenadas-columnas">
                        {columnasVisuales.map(col => (
                            <div key={col} className="coordenada-col">{col}</div>
                        ))}
                    </div>
                </div>
            </div>


            <div className="opciones">
                <Button funcion='abandonar' idPartida={idPartida}></Button>
            </div>
        </div>
    )
}
export default Partida