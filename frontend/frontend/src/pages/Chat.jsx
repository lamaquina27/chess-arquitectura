import { useEffect, useState } from 'react';
import './Chat.css';
import { obtenerPerfil } from '../api/obtener_perfil';
import { useLocation } from 'react-router-dom';


function Chat() {
    const [mensajes,setMensajes] = useState([]);
    const [mensajeNuevo,setMensajeNuevo] = useState("");
    const [socket, setSocket] = useState(null);
    const [datosPerfil, setDatosPerfil] = useState(null);
    const location = useLocation();
    const amigo = location.state ? location.state.amigoNombre : "Desconocido";
    const amigoId = location.state ? location.state.amigoId : null;
    
    
    useEffect(() => {
            const cargar = async () => {
                const data = await obtenerPerfil();
                setDatosPerfil(data); // Guardamos la data en el estado de React
            }
            cargar();
        }, []); 
    useEffect(() => {
        if (!datosPerfil) return;

        // Cargar historial de mensajes
        const cargarHistorial = async () => {
            try {
                const response = await fetch(`http://${window.location.hostname}:8000/mensajes/${datosPerfil.username}/${amigo}`);
                if (response.ok) {
                    const data = await response.json();
                    // Transformar data a formato que usa el frontend {user, message}
                    const historial = data.map(m => ({
                        user: m.remitente,
                        message: m.contenido
                    }));
                    setMensajes(historial);
                }
            } catch (error) {
                console.error("Error al cargar historial", error);
            }
        };

        cargarHistorial();

        const ws = new WebSocket(`ws://${window.location.hostname}:8000/ws/${datosPerfil.username}/${amigo}`);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMensajes((prev) => [...prev, data]);
        };
        setSocket(ws);
        return () => {
            ws.close();
        };
        
    }, [datosPerfil]);
    const enviarMensaje = () => {
        if (socket && mensajeNuevo.trim() !== "") {
            // Enviamos el mensaje al servidor en formato JSON
            socket.send(mensajeNuevo );
            setMensajeNuevo(""); // Limpiamos el input
        }
    };
    return (
        <div className="main">
            <div className="chat-page">
                <header className="chat-header">
                    <div className="status-dot"></div>
                    <h2>chat con: {amigo}</h2>
                </header>
                <div className="messages-container">
                    {mensajes.map((msg, index) => (
                        <div key={index} className={`message ${msg.user === datosPerfil.username ? 'sent' : 'received'}`}>
                            <strong>{msg.user}: </strong> {msg.message}
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
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;

