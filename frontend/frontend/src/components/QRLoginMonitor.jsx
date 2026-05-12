import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { generarQRLogin } from '../api/qr_login';

function QRLoginMonitor() {
    const [qrData, setQrData] = useState(null);
    const [status, setStatus] = useState("Cargando...");
    const navigate = useNavigate();

    useEffect(() => {
        let ws = null;

        const iniciarSesionQR = async () => {
            const data = await generarQRLogin();
            if (data.error) {
                setStatus("Error al generar el QR");
                return;
            }

            setQrData(data);
            setStatus("Escanea este QR desde tu celular para iniciar sesión");

            // Conectar al websocket usando el ID de la sala
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            ws = new WebSocket(`${wsProtocol}//${window.location.hostname}:5173/api/ws/qr/${data.sala}`);
            
            ws.onmessage = (event) => {
                const mensaje = JSON.parse(event.data);
                if (mensaje.status === "success") {
                    // Iniciar sesión con el token recibido
                    localStorage.setItem("token", mensaje.access_token);
                    setStatus("¡Inicio de sesión exitoso! Redirigiendo...");
                    setTimeout(() => {
                        navigate("/inicio"); // o la ruta de inicio de tu app
                    }, 1500);
                }
            };

            ws.onerror = () => {
                setStatus("Error en la conexión WebSocket");
            };
        };

        iniciarSesionQR();

        return () => {
            if (ws) ws.close();
        };
    }, [navigate]);

    return (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#1e1e1e', color: 'white', borderRadius: '10px', margin: '20px auto', maxWidth: '400px' }}>
            <h3>Inicio de Sesión con QR</h3>
            <p>{status}</p>
            {qrData && (
                <div style={{ background: 'white', padding: '20px', display: 'inline-block', borderRadius: '10px', marginTop: '20px' }}>
                    <QRCodeSVG 
                        value={JSON.stringify({ sala: qrData.sala, token: qrData.token })} 
                        size={256} 
                    />
                </div>
            )}
            <br />
            <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Volver</button>
        </div>
    );
}

export default QRLoginMonitor;
