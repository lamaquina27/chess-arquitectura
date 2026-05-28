import { useState, useRef, useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { verificarQRLogin } from '../api/qr_login';

function QRScannerMobile({ onClose }) {
    const [resultado, setResultado] = useState("");
    const [escaneando, setEscaneando] = useState(false);
    const videoRef = useRef(null);
    const controlsRef = useRef(null);

    const manejarResultadoQR = async (dataString, controls) => {
        controls.stop();
        setEscaneando(false);
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
        } catch {
            setResultado("El código QR no es válido para esta app");
        }
    };

    const obtenerConstraintCamaraTrasera = async () => {
        // Pedir permiso primero para que los labels de dispositivos estén disponibles
        const streamTemporal = await navigator.mediaDevices.getUserMedia({ video: true });
        streamTemporal.getTracks().forEach(t => t.stop());

        const dispositivos = await navigator.mediaDevices.enumerateDevices();
        const camaras = dispositivos.filter(d => d.kind === 'videoinput');

        const camaraTrasera = camaras.find(d => /back|rear|environment|trasera/i.test(d.label));

        if (camaraTrasera) {
            return { video: { deviceId: { exact: camaraTrasera.deviceId } } };
        }
        // Si no encontramos por label, usamos facingMode estricto
        return { video: { facingMode: { exact: 'environment' } } };
    };

    const iniciarEscaneo = async () => {
        setEscaneando(true);
        setResultado("");

        const callback = (result, error, controls) => {
            if (result) manejarResultadoQR(result.getText(), controls);
        };

        try {
            const constraint = await obtenerConstraintCamaraTrasera();
            const codeReader = new BrowserQRCodeReader();
            controlsRef.current = await codeReader.decodeFromConstraints(constraint, videoRef.current, callback);
        } catch {
            // Fallback: dejar que el browser elija la cámara trasera sin restricción estricta
            try {
                const codeReader = new BrowserQRCodeReader();
                controlsRef.current = await codeReader.decodeFromConstraints(
                    { video: { facingMode: 'environment' } },
                    videoRef.current,
                    callback
                );
            } catch (err) {
                setResultado(`Error al abrir cámara: ${err.message}`);
                setEscaneando(false);
            }
        }
    };

    const detenerEscaneo = () => {
        if (controlsRef.current) controlsRef.current.stop();
        setEscaneando(false);
    };

    useEffect(() => {
        return () => {
            if (controlsRef.current) controlsRef.current.stop();
        };
    }, []);

    return (
        <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
                Escanear QR de Monitor
            </p>

            {escaneando ? (
                <div>
                    <video ref={videoRef} style={{ width: '100%', maxWidth: '280px', borderRadius: '12px', background: '#000' }} />
                    <br />
                    <button
                        onClick={detenerEscaneo}
                        style={{ marginTop: 12, padding: '10px 24px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem' }}
                    >
                        Cancelar
                    </button>
                </div>
            ) : (
                <button
                    onClick={iniciarEscaneo}
                    style={{ padding: '11px 28px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem', transition: 'background 0.15s' }}
                >
                    Abrir Cámara
                </button>
            )}

            {resultado && (
                <p style={{ marginTop: 16, fontSize: '0.875rem', padding: '10px 14px', borderRadius: 10, background: resultado.includes('éxito') ? '#f0fdf4' : '#fef2f2', color: resultado.includes('éxito') ? '#16a34a' : '#dc2626', border: `1px solid ${resultado.includes('éxito') ? '#bbf7d0' : '#fecaca'}` }}>
                    {resultado}
                </p>
            )}
        </div>
    );
}

export default QRScannerMobile;
