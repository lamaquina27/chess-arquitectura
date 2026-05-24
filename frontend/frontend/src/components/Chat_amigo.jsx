import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './chat_amigo.css';

function Chat_amigo({ miId }) {
    const navigate = useNavigate();
    const [amigos, setAmigos] = useState([]);

    useEffect(() => {
        if (!miId) return;
        const cargarAmigos = async () => {
            const response = await fetch(`/amistad/lista/${miId}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAmigos(data);
            }
        };
        cargarAmigos();
    }, [miId]);

    if (amigos.length === 0) return null;

    return (
        <div className="friends-list-container">
            <p className="friends-list-title">Amigos ({amigos.length})</p>
            {amigos.map((amigo) => (
                <button
                    key={amigo.id}
                    className="friend-item-card"
                    onClick={() => navigate('/chat', {
                        state: { amigoNombre: amigo.nombre, amigoId: amigo.id, amigoElo: amigo.elo }
                    })}
                >
                    <div className="friend-avatar">
                        {amigo.avatar}
                        <span className={`status-indicator ${amigo.estado}`}></span>
                    </div>
                    <div className="friend-info">
                        <span className="friend-name">{amigo.nombre}</span>
                        <span className="friend-elo">{amigo.elo} ELO</span>
                    </div>
                </button>
            ))}
        </div>
    );
}

export default Chat_amigo;
