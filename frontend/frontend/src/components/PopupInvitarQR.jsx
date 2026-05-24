import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { BrowserQRCodeReader } from "@zxing/browser";
import "./Popup.css";

const OPCIONES_TIEMPO = [
    { label: "Sin límite", valor: null },
    { label: "5 min",      valor: 5   },
    { label: "10 min",     valor: 10  },
    { label: "15 min",     valor: 15  },
    { label: "30 min",     valor: 30  },
];

const OPCIONES_COLOR = [
    { valor: "blancas",   icon: "♔", label: "Blancas"   },
    { valor: "negras",    icon: "♚", label: "Negras"    },
    { valor: "aleatorio", icon: "🎲", label: "Aleatorio" },
];

function PopupInvitarQR({ cerrar }) {
    const navigate = useNavigate();
    // "" = pantalla inicial | "config" = configurar | "generar" = mostrar QR | "escanear" = cámara
    const [modo, setModo] = useState("");
    const [inviteId, setInviteId] = useState(null);
    const [errorTexto, setErrorTexto] = useState("");
    const [colorHost, setColorHost] = useState("aleatorio");
    const [tiempoMin, setTiempoMin] = useState(null);

    const esMobil = /Mobi|Android/i.test(navigator.userAgent);

    // En PC se salta la pantalla inicial y va directo a configurar
    useEffect(() => {
        if (!esMobil) setModo("config");
    }, []);

    useEffect(() => {
        let ws;
        if (modo === "generar" && inviteId) {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            ws = new WebSocket(`${protocol}//${window.location.host}/api/ws/invite/${inviteId}`);
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.status === "partida_iniciada") {
                    ws.close();
                    navigate("/partida", { state: { partidaData: data.partidaData } });
                }
            };
        }
        return () => { if (ws) ws.close(); };
    }, [modo, inviteId, navigate]);

    const generarQR = async () => {
        setErrorTexto("");
        try {
            const token = localStorage.getItem("token");
            const tiempoSeg = tiempoMin ? tiempoMin * 60 : null;
            const params = new URLSearchParams({ color_host: colorHost });
            if (tiempoSeg) params.append("tiempo", tiempoSeg);

            const response = await fetch(`/api/invite/generate?${params}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setInviteId(data.invite_id);
                setModo("generar");
            } else {
                setErrorTexto(data.detail || "Error al generar invitación");
            }
        } catch {
            setErrorTexto("Error de conexión al generar la invitación");
        }
    };

    const aceptarQR = async (scannedId) => {
        setErrorTexto("");
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/invite/accept`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ invite_id: scannedId })
            });
            const text = await response.text();
            let data;
            try { data = JSON.parse(text); } catch { data = {}; }

            if (response.ok) {
                navigate("/partida", { state: { partidaData: data } });
            } else {
                setErrorTexto(data.detail || `Error ${response.status} al aceptar invitación`);
                setModo("");
            }
        } catch {
            setErrorTexto("Error de conexión al aceptar la invitación");
            setModo("");
        }
    };

    const iniciarEscaneo = async () => {
        setModo("escanear");
        setErrorTexto("");
        try {
            const codeReader = new BrowserQRCodeReader();
            const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
            if (videoInputDevices.length === 0) {
                setErrorTexto("No se encontró cámara");
                setModo("");
                return;
            }
            const deviceId = videoInputDevices[0].deviceId;
            await codeReader.decodeFromVideoDevice(deviceId, "video", (result, err, controls) => {
                if (result) {
                    controls.stop();
                    aceptarQR(result.getText());
                }
            });
        } catch {
            setErrorTexto("Error accediendo a la cámara");
            setModo("");
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup" style={{ maxWidth: 460 }}>
                {errorTexto && (
                    <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 12, fontSize: '0.875rem' }}>
                        ⚠️ {errorTexto}
                    </p>
                )}

                {/* Pantalla inicial */}
                {modo === "" && (
                    <>
                        <h2>Multijugador por QR</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                            <button className="boton" onClick={() => setModo("config")}>
                                Invitar con QR
                            </button>
                            {esMobil && (
                                <button className="boton" onClick={iniciarEscaneo}>
                                    Escanear QR
                                </button>
                            )}
                            <button className="boton" onClick={cerrar} style={{ background: '#ef4444' }}>
                                Cancelar
                            </button>
                        </div>
                    </>
                )}

                {/* Pantalla de configuración (color + tiempo) */}
                {modo === "config" && (
                    <>
                        <h2>Configurar partida</h2>

                        <div className="config-seccion">
                            <p className="config-label">Tu color</p>
                            <div className="config-opciones">
                                {OPCIONES_COLOR.map(op => (
                                    <button
                                        key={op.valor}
                                        className={`config-btn${colorHost === op.valor ? " config-btn-activo" : ""}`}
                                        onClick={() => setColorHost(op.valor)}
                                    >
                                        <span className="config-btn-icon">{op.icon}</span>
                                        <span>{op.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="config-seccion">
                            <p className="config-label">Tiempo por jugador</p>
                            <div className="config-opciones config-opciones-tiempo">
                                {OPCIONES_TIEMPO.map(op => (
                                    <button
                                        key={op.valor ?? "sin-limite"}
                                        className={`config-btn${tiempoMin === op.valor ? " config-btn-activo" : ""}`}
                                        onClick={() => setTiempoMin(op.valor)}
                                    >
                                        {op.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                            <button className="boton" onClick={generarQR}>
                                Generar Código QR
                            </button>
                            {esMobil && (
                                <button className="boton" onClick={() => setModo("")} style={{ background: '#71717a' }}>
                                    Volver
                                </button>
                            )}
                            <button className="boton" onClick={cerrar} style={{ background: '#ef4444' }}>
                                Cancelar
                            </button>
                        </div>
                    </>
                )}

                {/* Pantalla QR generado */}
                {modo === "generar" && (
                    <>
                        <h2>Muestra este QR a tu rival</h2>
                        {inviteId && (
                            <div style={{ background: 'white', padding: 16, display: 'inline-block', margin: '10px 0', borderRadius: 8, border: '1px solid #e4e4e7' }}>
                                <QRCodeSVG value={inviteId} size={200} />
                            </div>
                        )}
                        <p style={{ color: '#71717a', fontSize: '0.875rem', margin: '4px 0 12px' }}>
                            Esperando a que el jugador escanee...
                        </p>
                        <button className="boton" onClick={cerrar} style={{ background: '#ef4444' }}>
                            Cancelar
                        </button>
                    </>
                )}

                {/* Pantalla escáner */}
                {modo === "escanear" && (
                    <>
                        <h2>Escanea el QR del anfitrión</h2>
                        <div style={{ width: '100%', maxWidth: 300, margin: '0 auto' }}>
                            <video id="video" width="100%" height="auto" style={{ border: '1px solid #e4e4e7', borderRadius: 8 }} />
                        </div>
                        <button className="boton" onClick={() => setModo("")} style={{ background: '#ef4444', marginTop: 12 }}>
                            Cancelar
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default PopupInvitarQR;
