import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './chat_amigo.css';

// Agregamos `miId` como parámetro (prop)
function Chat_amigo({ miId }) {
    const navigate = useNavigate();
    
    // Cambiamos el arreglo fijo por un Estado que empieza vacío
    const [amigos, setAmigos] = useState([]);

    useEffect(() => {
        // Si no nos pasan el ID, no hacemos nada aún
        if (!miId) return;

        const cargarAmigos = async () => {
            const response = await fetch(`/amistad/lista/${miId}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAmigos(data); // Llenamos la lista con la base de datos real
            }
        };
        cargarAmigos();
    }, [miId]); // Se vuelve a ejecutar si `miId` cambia

    return (
        <div className="friends-list-container">
            <h3>Tus Amigos</h3>
            {amigos.length === 0 ? <p style={{color: 'gray', textAlign: 'center'}}>Aún no tienes amigos agregados.</p> : null}
            
            {amigos.map((amigo) => (
                <button 
                    key={amigo.id} 
                    className="friend-item-card" 
                    onClick={() => navigate('/chat',{
                        state :{
                            amigoNombre : amigo.nombre,
                            amigoId : amigo.id
                        }
                    })}
                >
                    <div className="friend-avatar">
                        {amigo.avatar}
                        <span className={`status-indicator ${amigo.estado}`}></span>
                    </div>
                    <div className="friend-info">
                        <span className="friend-name">{amigo.nombre}</span>
                        <span className="friend-status-text">{amigo.estado}</span>
                    </div>
                </button>
            ))}
        </div>
    );
}

export default Chat_amigo;
