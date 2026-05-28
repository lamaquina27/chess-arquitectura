import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPerfil } from '../api/obtener_perfil';
import { buscarUsuario } from '../api/buscar_usuario';
import { enviarSolicitud } from '../api/enviar_solicitud';
import Chat_amigo from '../components/Chat_amigo';
import { obtenerPendientes } from '../api/obtener_pendientes';
import { aceptarSolicitud } from '../api/aceptar_solicitud';
import { rechazarSolicitud } from '../api/rechazar_solicitud';
import QRScannerMobile from '../components/QRScannerMobile';
import './Perfil.css';

function Perfil() {
    const [datosPerfil, setDatosPerfil] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [resultadoBusqueda, setResultadoBusqueda] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [solicitudes, setSolicitudes] = useState([]);
    const [showQRPopup, setShowQRPopup] = useState(false);

    const navigate = useNavigate();
    const esMobil = /Mobi|Android/i.test(navigator.userAgent);

    useEffect(() => {
        const cargar = async () => {
            const data = await obtenerPerfil();
            setDatosPerfil(data);
            if (data && data.id_usuario) {
                const pendientes = await obtenerPendientes(data.id_usuario);
                setSolicitudes(pendientes);
            }
        }
        cargar();
    }, []);

    const handleBuscar = async () => {
        setMensaje("");
        const usuarioEncontrado = await buscarUsuario(busqueda);
        if (usuarioEncontrado) {
            setResultadoBusqueda(usuarioEncontrado);
        } else {
            setResultadoBusqueda(null);
            setMensaje("No se encontró ningún jugador con ese nombre.");
        }
    }

    const handleAgregarAmigo = async () => {
        if (datosPerfil.id_usuario === resultadoBusqueda.id) {
            setMensaje("No puedes enviarte una solicitud a ti mismo.");
            return;
        }
        try {
            const resultado = await enviarSolicitud(datosPerfil.id_usuario, resultadoBusqueda.id);
            if (resultado.error) {
                setMensaje(resultado.mensaje);
                return;
            }
            setMensaje("¡Solicitud enviada con éxito!");
            setResultadoBusqueda(null);
            setBusqueda("");
        } catch {
            setMensaje("Hubo un error al enviar la solicitud.");
        }
    }

    const handleResponderSolicitud = async (emisorId, accion) => {
        let exito = false;
        if (accion === 'aceptar') {
            exito = await aceptarSolicitud(emisorId, datosPerfil.id_usuario);
        } else {
            exito = await rechazarSolicitud(emisorId, datosPerfil.id_usuario);
        }
        if (exito) {
            setSolicitudes(solicitudes.filter(s => s.emisor_id !== emisorId));
        }
    };

    const inicial = datosPerfil?.username?.charAt(0).toUpperCase() || '?';

    return (
        <div className="perfil-page">
            <div className="perfil-header-bar">
                <button className="perfil-back" onClick={() => navigate('/inicio')}>
                    ← Inicio
                </button>
                <span className="perfil-back-sep">/</span>
                <span className="perfil-back-title">Perfil</span>
            </div>

            <div className="perfil-container">
                {datosPerfil ? (
                    <div className="perfil-card">
                        <div className="perfil-avatar">{inicial}</div>
                        <div className="perfil-datos">
                            <span className="perfil-username">{datosPerfil.username}</span>
                            <span className="perfil-elo-badge">⭐ {datosPerfil.elo} ELO</span>
                            <span className="perfil-id"># {datosPerfil.id_usuario}</span>
                        </div>
                    </div>
                ) : (
                    <p style={{ color: '#71717a', textAlign: 'center', padding: '20px' }}>Cargando...</p>
                )}

                <p className="perfil-seccion-label">Buscar jugadores</p>
                <div className="perfil-seccion">
                    <div className="perfil-seccion-inner">
                        <div className="perfil-busqueda">
                            <input
                                type="text"
                                placeholder="Nombre de usuario..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                            />
                            <button className="boton" onClick={handleBuscar}>Buscar</button>
                        </div>
                        {resultadoBusqueda && (
                            <div className="perfil-resultado">
                                <span>{resultadoBusqueda.username}</span>
                                <button className="boton" onClick={handleAgregarAmigo}>Agregar</button>
                            </div>
                        )}
                        {mensaje && <p className="perfil-mensaje">{mensaje}</p>}
                    </div>
                </div>

                {solicitudes.length > 0 && (
                    <>
                        <p className="perfil-seccion-label">Solicitudes de amistad ({solicitudes.length})</p>
                        <div className="perfil-seccion">
                            <div className="perfil-seccion-inner">
                                {solicitudes.map((solicitud) => (
                                    <div key={solicitud.solicitud_id} className="solicitud-item">
                                        <span className="solicitud-nombre">
                                            <strong>{solicitud.emisor_username}</strong> quiere ser tu amigo
                                        </span>
                                        <div className="solicitud-acciones">
                                            <button className="btn-aceptar" onClick={() => handleResponderSolicitud(solicitud.emisor_id, 'aceptar')}>Aceptar</button>
                                            <button className="btn-rechazar" onClick={() => handleResponderSolicitud(solicitud.emisor_id, 'rechazar')}>Rechazar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {esMobil && (
                    <button className="btn-escanear-qr" onClick={() => setShowQRPopup(true)}>
                        📷 Escanear QR de Monitor
                    </button>
                )}
            </div>

            {showQRPopup && (
                <div className="popup-qr-overlay" onClick={() => setShowQRPopup(false)}>
                    <div className="popup-qr-box" onClick={e => e.stopPropagation()}>
                        <button className="popup-qr-close" onClick={() => setShowQRPopup(false)}>×</button>
                        <QRScannerMobile onClose={() => setShowQRPopup(false)} />
                    </div>
                </div>
            )}

            <Chat_amigo miId={datosPerfil ? datosPerfil.id_usuario : null} />
        </div>
    );
}

export default Perfil;
