import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { iniciarMutijugador } from "../api/iniciar_multijugador";
import "./Popup.css";

function PopupTipoPartida({ cerrar }) {
    const navigate = useNavigate();
    // Este estado decide si mostramos los 2 botones iniciales o el formulario de Login
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorTexto, setErrorTexto] = useState("");

    const iniciarPractica = () => {
        // Modo 1: Práctica. Enviamos al jugador directo a la ruta igual que hacías antes.
        navigate("/partida");
    };

    const manejarSubmit = async (e) => {
        e.preventDefault();
        // Modo 2: Perfil Real. Intentamos llamar a la API que creaste en el Paso 3
        const data = await iniciarMutijugador(username, password);

        if (data.error) {
            setErrorTexto(data.mensaje);
        } else {
            // ¡ÉXITO! Viajamos al tablero y, mediante el "state", llevamos los datos 
            // pre-cargados ocultos en la mochila para no tener que consultarlo de nuevo.
            navigate("/partida", { state: { partidaData: data } });
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                {!mostrarFormulario ? (
                    <>
                        <h2>¿Cómo quieres jugar?</h2>
                        <button className="boton" onClick={iniciarPractica} style={{ margin: '10px' }}>
                            Partida Práctica (Invitado)
                        </button>
                        <button className="boton" onClick={() => setMostrarFormulario(true)} style={{ margin: '10px' }}>
                            Contra Perfil Real
                        </button>
                        <button className="boton" onClick={cerrar} style={{ background: '#b00', margin: '10px' }}>
                            Cancelar
                        </button>
                    </>
                ) : (
                    <form onSubmit={manejarSubmit}>
                        <h2>Inicia sesión (Jugador Negro)</h2>
                        {errorTexto && <p style={{ color: '#b00', fontWeight: 'bold' }}>{errorTexto}</p>}
                        <div>
                            <input
                                type="text" placeholder="Username" required
                                value={username} onChange={(e) => setUsername(e.target.value)}
                                style={{ marginBottom: '10px' }}
                            />
                        </div>
                        <div>
                            <input
                                type="password" placeholder="Contraseña" required
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                style={{ marginBottom: '10px' }}
                            />
                        </div>

                        <button className="boton" type="submit" style={{ margin: '5px' }}>¡Jugar!</button>
                        <button className="boton" type="button" onClick={() => setMostrarFormulario(false)} style={{ background: 'gray', margin: '5px' }}>Atrás</button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default PopupTipoPartida;
