import { useState, useRef, useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { verificarQRLogin } from '../api/qr_login';

function QRScannerMobile() {
    const [resultado, setResultado] = useState("");
    const [escaneando, setEscaneando] = useState(false);
    const videoRef = useRef(null);
    const controlsRef = useRef(null); // Reference to keep the scanning active/inactive

    const iniciarEscaneo = async () => {
        setEscaneando(true);
        setResultado("");
        try {
            const codeReader = new BrowserQRCodeReader();
            const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();

            if (videoInputDevices.length === 0) {
                setResultado("No se encontraron cámaras en este dispositivo.");
                setEscaneando(false);
                return;
            }
            // Seleccionamos la cámara (la última suele ser la trasera en móviles)
            const selectedDeviceId = videoInputDevices.length > 1
                ? videoInputDevices[videoInputDevices.length - 1].deviceId
                : videoInputDevices[0].deviceId;
            controlsRef.current = await codeReader.decodeFromVideoDevice(
                selectedDeviceId,
                videoRef.current,
                async (result, error, controls) => {
                    if (result) {
                        controls.stop();
                        setEscaneando(false);
                        const dataString = result.getText();
                        try {
                            const data = JSON.parse(dataString);
                            if (data.sala && data.token) {
                                setResultado("Validando código QR...");
                                const res = await verificarQRLogin(data.sala, data.token);
                                if (res.error) {
                                    setResultado(`Error: ${res.mensaje}`);
                                } else {
                                    setResultado("¡Monitor logueado con éxito!");
                                }
                            } else {
                                setResultado("Formato de QR inválido");
                            }
                        } catch (e) {
                            setResultado("El código QR no es válido para esta app");
                        }
                    }
                }
            );
        } catch (error) {
            console.error(error);
            // Esto nos dirá si es un problema de HTTPS (NotAllowedError o SecurityError)
            setResultado(`Error: ${error.name} - ${error.message}`);
            setEscaneando(false);
        }
    };

    const detenerEscaneo = () => {
        if (controlsRef.current) {
            controlsRef.current.stop();
        }
        setEscaneando(false);
    };

    useEffect(() => {
        // Cleanup al desmontar el componente
        return () => {
            if (controlsRef.current) {
                controlsRef.current.stop();
            }
        };
    }, []);

    return (
        <div style={{ textAlign: 'center', padding: '20px', background: '#2c2c2c', borderRadius: '10px', marginTop: '20px' }}>
            <h3 style={{ color: 'white' }}>Escanear QR de Monitor</h3>

            {escaneando ? (
                <div>
                    <video ref={videoRef} style={{ width: '100%', maxWidth: '300px', borderRadius: '10px' }}></video>
                    <br />
                    <button onClick={detenerEscaneo} style={{ marginTop: '10px', padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Cancelar
                    </button>
                </div>
            ) : (
                <button onClick={iniciarEscaneo} style={{ marginTop: '10px', padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Abrir Cámara
                </button>
            )}

            {resultado && <p style={{ color: '#f1c40f', marginTop: '15px' }}>{resultado}</p>}
        </div>
    );
}

export default QRScannerMobile;
