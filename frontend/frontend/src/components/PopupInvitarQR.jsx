import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { BrowserQRCodeReader } from "@zxing/browser";
import "./Popup.css";

function PopupInvitarQR({ cerrar }) {
    const navigate = useNavigate();
    const [modo, setModo] = useState(""); // "generar" o "escanear"
    const [inviteId, setInviteId] = useState(null);
    const [errorTexto, setErrorTexto] = useState("");
    const [escaneando, setEscaneando] = useState(false);

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
        return () => {
            if (ws) ws.close();
        };
    }, [modo, inviteId, navigate]);

    const generarQR = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/invite/generate`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setInviteId(data.invite_id);
                setModo("generar");
            } else {
                setErrorTexto(data.detail || "Error al generar invitación");
            }
        } catch (error) {
            setErrorTexto("Error de conexión");
        }
    };

    const aceptarQR = async (scannedId) => {
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
            const data = await response.json();
            if (response.ok) {
                navigate("/partida", { state: { partidaData: data } });
            } else {
                setErrorTexto(data.detail || "Error al aceptar invitación");
                setModo("");
                setEscaneando(false);
            }
        } catch (error) {
            setErrorTexto("Error de conexión");
            setModo("");
            setEscaneando(false);
        }
    };

    const iniciarEscaneo = async () => {
        setModo("escanear");
        setEscaneando(true);
        setErrorTexto("");
        
        try {
            const codeReader = new BrowserQRCodeReader();
            const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
            
            if (videoInputDevices.length === 0) {
                setErrorTexto("No se encontró cámara");
                setEscaneando(false);
                return;
            }

            const deviceId = videoInputDevices[0].deviceId;
            await codeReader.decodeFromVideoDevice(deviceId, "video", (result, err, controls) => {
                if (result) {
                    controls.stop();
                    setEscaneando(false);
                    aceptarQR(result.getText());
                }
                if (err && err.name === "NotFoundError") {
                    // Ignorar errores de "no se encontró QR" en este frame
                }
            });
        } catch (err) {
            setErrorTexto("Error accediendo a la cámara");
            setEscaneando(false);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                {errorTexto && <p style={{ color: '#b00', fontWeight: 'bold' }}>{errorTexto}</p>}
                
                {modo === "" && (
                    <>
                        <h2>Invitar Jugador a Jugador</h2>
                        <button className="boton" onClick={generarQR} style={{ margin: '10px' }}>
                            Generar Código QR
                        </button>
                        <button className="boton" onClick={iniciarEscaneo} style={{ margin: '10px' }}>
                            Escanear QR
                        </button>
                        <button className="boton" onClick={cerrar} style={{ background: '#b00', margin: '10px' }}>
                            Cancelar
                        </button>
                    </>
                )}

                {modo === "generar" && (
                    <>
                        <h2>Muestra este QR a tu rival</h2>
                        {inviteId && (
                            <div style={{ background: 'white', padding: '16px', display: 'inline-block', margin: '10px 0' }}>
                                <QRCodeSVG value={inviteId} size={200} />
                            </div>
                        )}
                        <p>Esperando a que el jugador escanee...</p>
                        <button className="boton" onClick={cerrar} style={{ background: '#b00', margin: '10px' }}>
                            Cancelar
                        </button>
                    </>
                )}

                {modo === "escanear" && (
                    <>
                        <h2>Escanea el QR del anfitrión</h2>
                        <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                            <video id="video" width="100%" height="auto" style={{ border: '1px solid #ccc' }}></video>
                        </div>
                        <button className="boton" onClick={() => { setModo(""); setEscaneando(false); }} style={{ background: '#b00', margin: '10px' }}>
                            Cancelar
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default PopupInvitarQR;
