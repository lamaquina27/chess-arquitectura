import { useState, useEffect, useRef } from "react"
import { moverPieza } from "../api/mover_pieza"
import { iniciarPartida } from "../api/iniciar_partida"
import { useNavigate, useLocation } from "react-router-dom";

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

// Nombres legibles de piezas
const nombrePieza = {
    'R': 'Rey', 'D': 'Dama', 'T': 'Torre', 'A': 'Alfil', 'C': 'Caballo', 'P': 'Peón',
    'r': 'Rey', 'd': 'Dama', 't': 'Torre', 'a': 'Alfil', 'c': 'Caballo', 'p': 'Peón',
}

function Partida() {
    const [infoPartida, setInfoPartida] = useState(null)
    const [tablero, setTablero] = useState(() => crearTableroInicial())
    const [celdaSeleccionada, setCeldaSeleccionada] = useState(null)
    const [idPartida, setIdPartida] = useState(null)
    const [turno, setTurno] = useState("")
    const [miColor, setMiColor] = useState(null)
    const [esOnline, setEsOnline] = useState(false)
    const [miUsername, setMiUsername] = useState("")
    // Lista de movimientos
    const [movimientos, setMovimientos] = useState([])
    // Chat
    const [mensajesChat, setMensajesChat] = useState([])
    const [inputChat, setInputChat] = useState("")

    const ws = useRef(null)
    // Refs para evitar stale closures en manejarClickCelda
    const turnoRef = useRef("")
    const miColorRef = useRef(null)
    const chatEndRef = useRef(null)
    const movListRef = useRef(null)
    const navigate = useNavigate()
    const location = useLocation()
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

    // Auto-scroll del chat
    useEffect(() => {
        if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, [mensajesChat]);

    // Auto-scroll de la lista de movimientos
    useEffect(() => {
        if (movListRef.current) movListRef.current.scrollTop = movListRef.current.scrollHeight;
    }, [movimientos]);

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
                setMiUsername(data.username || "");
                // Cargar historial de movimientos
                if (data.historial_movimientos) {
                    setMovimientos(data.historial_movimientos);
                }
                // Cargar historial de chat
                if (data.historial_chat) {
                    setMensajesChat(data.historial_chat);
                }
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
                    // Añadir a la lista de movimientos
                    setMovimientos(prev => [...prev, {
                        numero: data.numero_movimiento,
                        pieza: data.pieza,
                        casilla_inicio: data.casilla_inicio,
                        casilla_llegada: data.casilla_llegada
                    }]);
                }
            } else if (data.action === "chat_message") {
                setMensajesChat(prev => [...prev, {
                    remitente: data.remitente,
                    contenido: data.contenido
                }]);
            } else if (data.error) {
                alert(data.error);
            }
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [idPartida, esOnline]);


    if (!infoPartida) return <div className="loading">Cargando partida...</div>

    const manejarClickCelda = (casilla) => {
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
                        alert("Solo estás observando la partida.");
                        return;
                    }
                    if (colorPieza !== miColorActual) {
                        alert(`Solo puedes mover tus piezas (${miColorActual}s)`);
                        return;
                    }
                    if (miColorActual !== turnoActual) {
                        alert(`Es el turno de tu rival.`);
                        return;
                    }
                } else {
                    if (colorPieza !== turno) {
                        alert(`No es tu turno. Turno de las ${turno}s`);
                        return;
                    }
                }
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
                // Añadir a la lista de movimientos en modo local
                setMovimientos(prev => [...prev, {
                    numero: prev.length + 1,
                    pieza: piezaMovida,
                    casilla_inicio: celdaSeleccionada,
                    casilla_llegada: casilla
                }]);
            }
            
            setCeldaSeleccionada(null)
        }
    }

    const enviarMensajeChat = (e) => {
        e.preventDefault();
        if (!inputChat.trim() || !ws.current) return;
        ws.current.send(JSON.stringify({
            action: "chat_message",
            contenido: inputChat.trim()
        }));
        setInputChat("");
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
            </div>

            <div className="partida-layout">
                {/* Panel izquierdo: Lista de Movimientos */}
                <div className="panel-movimientos">
                    <h3>📋 Movimientos</h3>
                    <div className="movimientos-lista" ref={movListRef}>
                        {movimientos.length === 0 ? (
                            <p className="sin-movimientos">Aún no hay movimientos</p>
                        ) : (
                            movimientos.map((mov, i) => {
                                const esBlanca = mov.pieza === mov.pieza.toUpperCase();
                                return (
                                    <div key={i} className={`movimiento-item ${esBlanca ? 'mov-blanco' : 'mov-negro'}`}>
                                        <span className="mov-numero">{mov.numero}.</span>
                                        <span className="mov-pieza">{piezasDict[mov.pieza]}</span>
                                        <span className="mov-detalle">
                                            {nombrePieza[mov.pieza]} {mov.casilla_inicio} → {mov.casilla_llegada}
                                        </span>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Centro: Tablero */}
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

                        {/* Letras de columna abajo */}
                        <div className="coordenadas-columnas">
                            {columnasVisuales.map(col => (
                                <div key={col} className="coordenada-col">{col}</div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Panel derecho: Chat en vivo */}
                {esOnline && (
                    <div className="panel-chat">
                        <h3>💬 Chat</h3>
                        <div className="chat-mensajes">
                            {mensajesChat.length === 0 ? (
                                <p className="sin-mensajes">Saluda a tu rival</p>
                            ) : (
                                mensajesChat.map((msg, i) => (
                                    <div key={i} className={`chat-msg ${msg.remitente === miUsername ? 'msg-mio' : 'msg-rival'}`}>
                                        <span className="msg-autor">{msg.remitente}</span>
                                        <span className="msg-texto">{msg.contenido}</span>
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <form className="chat-input-form" onSubmit={enviarMensajeChat}>
                            <input
                                type="text"
                                className="chat-input"
                                placeholder="Escribe un mensaje..."
                                value={inputChat}
                                onChange={(e) => setInputChat(e.target.value)}
                                maxLength={200}
                            />
                            <button type="submit" className="chat-send-btn">➤</button>
                        </form>
                    </div>
                )}
            </div>

            <div className="opciones">
                <Button funcion='abandonar' idPartida={idPartida}></Button>
            </div>
        </div>
    )
}
export default Partida