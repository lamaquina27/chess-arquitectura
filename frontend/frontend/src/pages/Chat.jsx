import { useEffect, useState } from 'react';
import './chat.css';
import { obtenerPerfil } from '../api/obtener_perfil';
import { useLocation, useNavigate } from 'react-router-dom';

function Chat() {
    const [mensajes, setMensajes] = useState([]);
    const [mensajeNuevo, setMensajeNuevo] = useState("");
    const [socket, setSocket] = useState(null);
    const [datosPerfil, setDatosPerfil] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const amigo = location.state?.amigoNombre || "Desconocido";
    const amigoId = location.state?.amigoId || null;
    const amigoElo = location.state?.amigoElo || null;

    useEffect(() => {
        obtenerPerfil().then(data => setDatosPerfil(data));
    }, []);

    useEffect(() => {
        if (!datosPerfil) return;

        const cargarHistorial = async () => {
            try {
                const response = await fetch(`/mensajes/${datosPerfil.username}/${amigo}`);
                if (response.ok) {
                    const data = await response.json();
                    setMensajes(data.map(m => ({ user: m.remitente, message: m.contenido })));
                }
            } catch (error) {
                console.error("Error al cargar historial", error);
            }
        };

        cargarHistorial();

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${wsProtocol}//${window.location.hostname}:5173/ws/${datosPerfil.username}/${amigo}`);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMensajes(prev => [...prev, data]);
        };
        setSocket(ws);
        return () => ws.close();
    }, [datosPerfil]);

    const enviarMensaje = () => {
        if (socket && mensajeNuevo.trim()) {
            socket.send(mensajeNuevo);
            setMensajeNuevo("");
        }
    };

    return (
        <div className="chat-page-wrapper">
            <div className="chat-topbar">
                <button className="chat-back-btn" onClick={() => navigate(-1)}>←</button>
                <div className="chat-contact-avatar">{amigo.charAt(0).toUpperCase()}</div>
                <div className="chat-contact-info">
                    <span className="chat-topbar-name">{amigo}</span>
                    {amigoElo && <span className="chat-topbar-elo">{amigoElo} ELO</span>}
                </div>
            </div>

            <div style={{ padding: '0 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="chat-page">
                    <div className="messages-container">
                        {mensajes.map((msg, index) => (
                            <div key={index} className={`message ${msg.user === datosPerfil?.username ? 'sent' : 'received'}`}>
                                {msg.message}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input-area">
                        <input
                            type="text"
                            value={mensajeNuevo}
                            onChange={(e) => setMensajeNuevo(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                        />
                        <button className="send-button" onClick={enviarMensaje}>
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chat;
