import { useState, useEffect, useRef } from "react"
import { moverPieza } from "../api/mover_pieza"
import { iniciarPartida } from "../api/iniciar_partida"
import { useNavigate, useLocation } from "react-router-dom";
import { obtenerMovimientos } from "../api/obtener_movimientos"

import "./Partida.css"
import Button from "../components/Button"
import PopupPerdida from "../components/PopupPerdida"

const COLUMNAS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const FILAS = ['8', '7', '6', '5', '4', '3', '2', '1']

const nombrePieza = {
    'R': 'Rey', 'D': 'Dama', 'T': 'Torre', 'A': 'Alfil', 'C': 'Caballo', 'P': 'Peón',
    'r': 'Rey', 'd': 'Dama', 't': 'Torre', 'a': 'Alfil', 'c': 'Caballo', 'p': 'Peón',
}

function crearTableroInicial() {
    const tablero = {}
    const piezasNegras = ['t', 'c', 'a', 'd', 'r', 'a', 'c', 't']
    COLUMNAS.forEach((col, i) => {
        tablero[col + '8'] = piezasNegras[i]
        tablero[col + '7'] = 'p'
    })
    for (let fila = 6; fila >= 3; fila--) {
        COLUMNAS.forEach(col => { tablero[col + fila] = '' })
    }
    const piezasBlancas = ['T', 'C', 'A', 'D', 'R', 'A', 'C', 'T']
    COLUMNAS.forEach((col, i) => {
        tablero[col + '2'] = 'P'
        tablero[col + '1'] = piezasBlancas[i]
    })
    return tablero
}

const formatTiempo = (seg) => {
    if (seg === null || seg === undefined) return '';
    const m = Math.floor(seg / 60).toString().padStart(2, '0');
    const s = (seg % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

function Partida() {
    const [infoPartida, setInfoPartida] = useState(null)
    const [tablero, setTablero] = useState(() => crearTableroInicial())
    const [celdaSeleccionada, setCeldaSeleccionada] = useState(null)
    const [casillasValidas, setCasillasValidas] = useState([])
    const [idPartida, setIdPartida] = useState(null)
    const [turno, setTurno] = useState("")
    const [miColor, setMiColor] = useState(null)
    const [esOnline, setEsOnline] = useState(false)
    const [miUsername, setMiUsername] = useState("")
    const [movimientos, setMovimientos] = useState([])
    const [mensajesChat, setMensajesChat] = useState([])
    const [inputChat, setInputChat] = useState("")
    const [mensaje, setMensaje] = useState("")
    const [enJaque, setEnJaque] = useState(false)
    const [diJaque, setDiJaque] = useState(false)
    const [estadoFinal, setEstadoFinal] = useState(null)
    const [coronacionPendiente, setCoronacionPendiente] = useState(null)

    // Timer
    const [tieneTimer, setTieneTimer] = useState(false)
    const [tiempoBlancas, setTiempoBlancas] = useState(null)
    const [tiempoNegras, setTiempoNegras] = useState(null)
    const timerRef = useRef(null)

    const ws = useRef(null)
    const turnoRef = useRef("")
    const miColorRef = useRef(null)
    const chatEndRef = useRef(null)
    const movListRef = useRef(null)
    const diJaqueTimeoutRef = useRef(null)
    const mensajeTimeoutRef = useRef(null)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const cargar = async () => {
            if (location.state && location.state.partidaData) {
                const dataPrecargada = location.state.partidaData;
                setInfoPartida(dataPrecargada);
                setTurno(dataPrecargada.turno);
                setIdPartida(dataPrecargada.id_partida);
                setEsOnline(true);
                if (dataPrecargada.tiempo_inicial) {
                    setTiempoBlancas(dataPrecargada.tiempo_inicial);
                    setTiempoNegras(dataPrecargada.tiempo_inicial);
                    setTieneTimer(true);
                }
            } else {
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

    useEffect(() => { turnoRef.current = turno; }, [turno]);
    useEffect(() => { miColorRef.current = miColor; }, [miColor]);

    useEffect(() => {
        if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, [mensajesChat]);

    useEffect(() => {
        if (movListRef.current) movListRef.current.scrollTop = movListRef.current.scrollHeight;
    }, [movimientos]);

    // Timer tick — se reinicia cada vez que cambia el turno o finaliza la partida
    useEffect(() => {
        if (!tieneTimer) return;
        if (estadoFinal) {
            clearInterval(timerRef.current);
            return;
        }
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            if (turnoRef.current === 'blanco') {
                setTiempoBlancas(prev => {
                    if (prev === null) return null;
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        const mc = miColorRef.current;
                        setEstadoFinal(mc === 'negro' ? "victoria_tiempo" : mc === 'blanco' ? "derrota_tiempo" : "timeout");
                        return 0;
                    }
                    return prev - 1;
                });
            } else {
                setTiempoNegras(prev => {
                    if (prev === null) return null;
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        const mc = miColorRef.current;
                        setEstadoFinal(mc === 'blanco' ? "victoria_tiempo" : mc === 'negro' ? "derrota_tiempo" : "timeout");
                        return 0;
                    }
                    return prev - 1;
                });
            }
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [turno, estadoFinal, tieneTimer]);

    // WebSocket para partidas online
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
                if (data.historial) setMovimientos(data.historial);
                if (data.tiempo_inicial) {
                    setTiempoBlancas(data.tiempo_inicial);
                    setTiempoNegras(data.tiempo_inicial);
                    setTieneTimer(true);
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
                    setMovimientos(prev => [...prev, {
                        numero: data.numero_movimiento,
                        pieza: data.pieza,
                        casilla_inicio: data.casilla_inicio,
                        casilla_llegada: data.casilla_llegada
                    }]);
                    procesarEstadoJuego(data);
                }
            } else if (data.action === "chat_message") {
                setMensajesChat(prev => [...prev, {
                    remitente: data.remitente,
                    contenido: data.contenido
                }]);
            } else if (data.action === "abandono") {
                if (data.ganador_color === miColorRef.current) {
                    setEstadoFinal("victoria_abandono");
                } else {
                    setEstadoFinal("abandono");
                }
            } else if (data.error) {
                mostrarMensaje(data.error);
            }
        };

        return () => { if (ws.current) ws.current.close(); };
    }, [idPartida, esOnline]);

    if (!infoPartida) return <div className="loading">Cargando partida...</div>

    const mostrarMensaje = (texto) => {
        if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current)
        setMensaje(texto)
        mensajeTimeoutRef.current = setTimeout(() => setMensaje(""), 2500)
    }

    const procesarEstadoJuego = (estado) => {
        if (estado.jaque_mate) {
            setEstadoFinal("jaque_mate")
            setEnJaque(false); setDiJaque(false)
        } else if (estado.ahogado) {
            setEstadoFinal("ahogado")
            setEnJaque(false); setDiJaque(false)
        } else if (estado.jaque) {
            const miColorActual = miColorRef.current
            if (miColorActual && estado.turno !== miColorActual) {
                setDiJaque(true); setEnJaque(false)
                if (diJaqueTimeoutRef.current) clearTimeout(diJaqueTimeoutRef.current)
                diJaqueTimeoutRef.current = setTimeout(() => setDiJaque(false), 3000)
            } else {
                setEnJaque(true); setDiJaque(false)
            }
        } else {
            setEnJaque(false); setDiJaque(false)
        }
    }

    const enviarMovimiento = async (casilla_inicio, casilla_llegada, pieza, pieza_coronacion = null) => {
        if (esOnline && ws.current) {
            const msg = { action: "mover", casilla_inicio, casilla_llegada, pieza };
            if (pieza_coronacion) msg.pieza_coronacion = pieza_coronacion;
            ws.current.send(JSON.stringify(msg));
        } else {
            const piezaReal = pieza_coronacion || pieza;
            setTablero(prev => {
                const nuevo = { ...prev }
                nuevo[casilla_llegada] = piezaReal;
                nuevo[casilla_inicio] = '';
                return nuevo;
            })
            const respuesta = await moverPieza(casilla_inicio, casilla_llegada, pieza, idPartida, pieza_coronacion);
            if (respuesta) {
                setTurno(respuesta.turno);
                procesarEstadoJuego(respuesta);
            }
            setMovimientos(prev => [...prev, {
                numero: prev.length + 1,
                pieza: piezaReal,
                casilla_inicio,
                casilla_llegada
            }]);
        }
    }

    // Detectar si un peón llega a la última fila y necesita coronación
    const esPeonCoronable = (pieza, casilla) => {
        const fila = casilla[1];
        return (pieza === 'P' && fila === '8') || (pieza === 'p' && fila === '1');
    }

    const elegirCoronacion = async (piezaElegida) => {
        const { casilla_inicio, casilla_llegada, pieza } = coronacionPendiente;
        setCoronacionPendiente(null);
        await enviarMovimiento(casilla_inicio, casilla_llegada, pieza, piezaElegida);
    }

    const manejarClickCelda = async (casilla) => {
        if (estadoFinal || coronacionPendiente) return
        const pieza = tablero[casilla]

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
        } else {
            setCasillasValidas([])

            if (celdaSeleccionada === casilla) {
                setCeldaSeleccionada(null)
                return
            }

            if (!casillasValidas.includes(casilla)) {
                setCeldaSeleccionada(null)
                return
            }

            const piezaMovida = tablero[celdaSeleccionada]
            setCeldaSeleccionada(null)

            if (esPeonCoronable(piezaMovida, casilla)) {
                setCoronacionPendiente({ casilla_inicio: celdaSeleccionada, casilla_llegada: casilla, pieza: piezaMovida });
                return;
            }

            await enviarMovimiento(celdaSeleccionada, casilla, piezaMovida);
        }
    }

    const enviarMensajeChat = (e) => {
        e.preventDefault();
        if (!inputChat.trim() || !ws.current) return;
        ws.current.send(JSON.stringify({ action: "chat_message", contenido: inputChat.trim() }));
        setInputChat("");
    }

    const piezasDict = {
        'R': '♔', 'D': '♕', 'T': '♖', 'A': '♗', 'C': '♘', 'P': '♙',
        'r': '♚︎', 'd': '♛︎', 't': '♜︎', 'a': '♝︎', 'c': '♞︎', 'p': '♟︎',
        '': ''
    }

    // Piezas de coronación según color
    const piezasCorona = coronacionPendiente?.pieza === 'P'
        ? [{ k: 'D', s: '♕' }, { k: 'T', s: '♖' }, { k: 'A', s: '♗' }, { k: 'C', s: '♘' }]
        : [{ k: 'd', s: '♛︎' }, { k: 't', s: '♜︎' }, { k: 'a', s: '♝︎' }, { k: 'c', s: '♞︎' }];

    const filasVisuales = miColor === "negro" ? [...FILAS].reverse() : FILAS;
    const columnasVisuales = miColor === "negro" ? [...COLUMNAS].reverse() : COLUMNAS;

    const tiempoBlancasActivo = tieneTimer && turno === 'blanco' && !estadoFinal;
    const tiempoNegrasActivo  = tieneTimer && turno === 'negro'  && !estadoFinal;

    return (
        <div className="partida-container">
            <h1>Partida de Ajedrez</h1>

            <div className="info-panel">
                <div className={`jugador-card${esOnline && miColor === 'blanco' ? ' jugador-yo' : ''}`}>
                    <span className="jugador-card-icon">♔</span>
                    <div className="jugador-card-info">
                        <span className="jugador-card-nombre">{infoPartida.jugador_blanco}</span>
                        <span className="jugador-card-elo">
                            {infoPartida.jugador_blanco_elo != null ? `${infoPartida.jugador_blanco_elo} ELO` : ''}
                            {esOnline && miColor === 'blanco' && <span className="yo-badge">Tú</span>}
                        </span>
                    </div>
                    {tieneTimer && (
                        <span className={`timer-badge${tiempoBlancasActivo ? ' timer-activo' : ''}`}>
                            {formatTiempo(tiempoBlancas)}
                        </span>
                    )}
                </div>
                <span className="vs-sep">vs</span>
                <div className={`jugador-card${esOnline && miColor === 'negro' ? ' jugador-yo' : ''}`}>
                    <span className="jugador-card-icon">♚︎</span>
                    <div className="jugador-card-info">
                        <span className="jugador-card-nombre">{infoPartida.jugador_negro || '—'}</span>
                        <span className="jugador-card-elo">
                            {infoPartida.jugador_negro_elo != null ? `${infoPartida.jugador_negro_elo} ELO` : ''}
                            {esOnline && miColor === 'negro' && <span className="yo-badge">Tú</span>}
                        </span>
                    </div>
                    {tieneTimer && (
                        <span className={`timer-badge${tiempoNegrasActivo ? ' timer-activo' : ''}`}>
                            {formatTiempo(tiempoNegras)}
                        </span>
                    )}
                </div>
            </div>

            <div className={`turno-indicator ${turno === 'blanco' ? 'turno-blancas' : 'turno-negras'}`}>
                <span className="turno-dot" />
                {turno === 'blanco' ? '♔ Turno de Blancas' : '♚︎ Turno de Negras'}
            </div>

            <div className="toast-container">
                {mensaje && <div className="toast toast-aviso">{mensaje}</div>}
                {enJaque && !estadoFinal && (!esOnline || miColor === turno) && (
                    <div className="toast toast-jaque">⚠️ ¡Estás en jaque!</div>
                )}
                {diJaque && !estadoFinal && (
                    <div className="toast toast-jaque-rival">♟ ¡Jaque al rey rival!</div>
                )}
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
                    <div className="coordenadas-filas">
                        {filasVisuales.map(fila => (
                            <div key={fila} className="coordenada-fila">{fila}</div>
                        ))}
                    </div>
                    <div className="tablero-inner">
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
                                    const esPosible = casillasValidas.includes(casilla) && tablero[casilla] === ''
                                    const esCaptura = casillasValidas.includes(casilla) && tablero[casilla] !== ''

                                    return (
                                        <div
                                            key={casilla}
                                            className={`celda ${colorClase} ${clasePieza} ${isSeleccionada ? 'celda-seleccionada' : ''} ${esPosible ? 'celda-posible' : ''} ${esCaptura ? 'celda-captura' : ''}`}
                                            onClick={() => manejarClickCelda(casilla)}
                                            title={casilla}
                                        >
                                            {piezasDict[celda] || ""}
                                        </div>
                                    )
                                })
                            )}
                        </div>
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

            {/* Modal de coronación de peón */}
            {coronacionPendiente && (
                <div className="popup-overlay">
                    <div className="popup-corona">
                        <h3>Elige la pieza</h3>
                        <p className="corona-subtitulo">Tu peón llegó a la última fila</p>
                        <div className="corona-opciones">
                            {piezasCorona.map(({ k, s }) => (
                                <button key={k} className="corona-btn" onClick={() => elegirCoronacion(k)}>
                                    <span className="corona-pieza">{s}</span>
                                    <span className="corona-nombre">{nombrePieza[k]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {estadoFinal && <PopupPerdida motivo={estadoFinal} />}
        </div>
    )
}

export default Partida
