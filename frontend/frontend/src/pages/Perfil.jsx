import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerPerfil } from '../api/obtener_perfil';

function Perfil() {
    // Aquí guardaremos la información que regrese nuestro Backend
    const [datosPerfil, setDatosPerfil] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const cargar = async () => {
            const data = await obtenerPerfil();
            setDatosPerfil(data); // Guardamos la data en el estado de React
        }
        cargar();
    }, []); // Los "[]" vacíos significan: Ejecútalo solo 1 vez al cargar la página

    return (
        <div className="home-container">
            <h2>Tu Perfil de Jugador</h2>

            {/* Si ya llegaron los datos mostramos las letras, sino, mostramos "Cargando..." */}
            {datosPerfil ? (
                <div style={{ color: "white", margin: "20px" }}>
                    <p><strong>Usuario:</strong> {datosPerfil.username}</p>
                    <p><strong>Elo:</strong> {datosPerfil.elo}</p>
                    <p><strong>ID Jugador:</strong> {datosPerfil.id_usuario}</p>
                </div>
            ) : (
                <p>Cargando información segura...</p>
            )}

            {/* Un pequeño botón improvisado para regresar sin perdernos */}
            <button className="boton" onClick={() => navigate('/inicio')}>Volver al Tablero</button>
        </div>
    );
}

export default Perfil;
