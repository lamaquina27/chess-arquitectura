import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPerfil } from '../api/obtener_perfil';
import { buscarUsuario } from '../api/buscar_usuario'; // Importamos la búsqueda
import { enviarSolicitud } from '../api/enviar_solicitud'; // Importamos el envío
import Chat_amigo from '../components/Chat_amigo';
import { obtenerPendientes } from '../api/obtener_pendientes';
import { aceptarSolicitud } from '../api/aceptar_solicitud';
import { rechazarSolicitud } from '../api/rechazar_solicitud';
import QRScannerMobile from '../components/QRScannerMobile';


function Perfil() {
    const [datosPerfil, setDatosPerfil] = useState(null);
    const [busqueda, setBusqueda] = useState(""); // Lo que el usuario escribe
    const [resultadoBusqueda, setResultadoBusqueda] = useState(null); // El usuario encontrado
    const [mensaje, setMensaje] = useState(""); // Mensaje de éxito/error
    const [solicitudes, setSolicitudes] = useState([]); // Para guardar las solicitudes pendientes

    const navigate = useNavigate();

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

    // Función que se ejecuta al darle al botón "Buscar"
    const handleBuscar = async () => {
        setMensaje(""); // Limpiamos mensajes anteriores
        const usuarioEncontrado = await buscarUsuario(busqueda);
        
        if (usuarioEncontrado) {
            setResultadoBusqueda(usuarioEncontrado);
        } else {
            setResultadoBusqueda(null);
            setMensaje("No se encontró a ningún jugador con ese nombre.");
        }
    }

    // Función que se ejecuta al darle al botón "Agregar Amigo"
    const handleAgregarAmigo = async () => {
        try {
            // Pasamos MI id, y el ID del resultado de la búsqueda
            await enviarSolicitud(datosPerfil.id_usuario, resultadoBusqueda.id);
            setMensaje("¡Solicitud enviada con éxito!");
            setResultadoBusqueda(null); // Limpiamos la búsqueda después de enviar
            setBusqueda(""); 
        } catch (error) {
            setMensaje("Hubo un error al enviar la solicitud.");
        }
    }

    const handleResponderSolicitud = async (emisorId, accion) => {
        let exito = false;
        
        if (accion === 'aceptar') {
            // Recuerda que el emisorId es el ID del que nos envió la solicitud
            exito = await aceptarSolicitud(emisorId, datosPerfil.id_usuario);
        } else {
            exito = await rechazarSolicitud(emisorId, datosPerfil.id_usuario);
        }

        if (exito) {
            // Si funcionó, quitamos esa solicitud de la lista visualmente
            setSolicitudes(solicitudes.filter(s => s.emisor_id !== emisorId));
        }
    };

    return (
        <>
            <div className="home-container">
                <h2>Tu Perfil de Jugador</h2>

                {datosPerfil ? (
                    <div style={{ color: "white", margin: "20px" }}>
                        <p><strong>Usuario:</strong> {datosPerfil.username}</p>
                        <p><strong>Elo:</strong> {datosPerfil.elo}</p>
                        <p><strong>ID Jugador:</strong> {datosPerfil.id_usuario}</p>
                    </div>
                ) : (
                    <p>Cargando información segura...</p>
                )}

                {/* --- SECCIÓN NUEVA: BUSCADOR DE AMIGOS --- */}
                <div style={{ margin: "30px 0", padding: "20px", border: "1px solid #444", borderRadius: "10px" }}>
                    <h3>Buscar Amigos</h3>
                    <input 
                        type="text" 
                        placeholder="Nombre de usuario..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={{ padding: "8px", marginRight: "10px", borderRadius: "5px" }}
                    />
                    <button className="boton" onClick={handleBuscar}>Buscar</button>

                    {/* Si encontramos a alguien, mostramos su nombre y el botón de agregar */}
                    {resultadoBusqueda && (
                        <div style={{ marginTop: "15px", backgroundColor: "#222", padding: "10px", borderRadius: "5px" }}>
                            <p style={{ color: "white" }}>Jugador encontrado: <strong>{resultadoBusqueda.username}</strong></p>
                            <button className="boton" onClick={handleAgregarAmigo}>Enviar solicitud de amistad</button>
                        </div>
                    )}

                    {/* Mostrar mensajes de éxito o error */}
                    {mensaje && <p style={{ color: "#ffcc00", marginTop: "10px" }}>{mensaje}</p>}
                </div>
                {/* ----------------------------------------- */}

                <button className="boton" onClick={() => navigate('/inicio')}>Volver al Tablero</button>
            </div>
                            {/* --- SECCIÓN NUEVA: SOLICITUDES PENDIENTES --- */}
                {solicitudes.length > 0 && (
                    <div style={{ margin: "20px 0", padding: "20px", backgroundColor: "#333", borderRadius: "10px", border: "1px solid #555" }}>
                        <h3 style={{ color: "#ffcc00", margin: "0 0 15px 0" }}>Tienes {solicitudes.length} solicitudes de amistad</h3>
                        
                        {solicitudes.map((solicitud) => (
                            <div key={solicitud.solicitud_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#222", padding: "10px", borderRadius: "5px", marginBottom: "10px" }}>
                                <span style={{ color: "white", fontSize: "16px" }}>
                                    <strong>{solicitud.emisor_username}</strong> quiere ser tu amigo.
                                </span>
                                <div>
                                    <button 
                                        onClick={() => handleResponderSolicitud(solicitud.emisor_id, 'aceptar')}
                                        style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", marginRight: "10px" }}
                                    >
                                        ✓ Aceptar
                                    </button>
                                    <button 
                                        onClick={() => handleResponderSolicitud(solicitud.emisor_id, 'rechazar')}
                                        style={{ backgroundColor: "#F44336", color: "white", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer" }}
                                    >
                                        ✗ Rechazar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* --- SECCIÓN NUEVA: ESCANEAR QR --- */}
                <QRScannerMobile />
                {/* ----------------------------------------------- */}

            <Chat_amigo miId={datosPerfil ? datosPerfil.id_usuario : null}></Chat_amigo>

        </>
    );
}

export default Perfil;
