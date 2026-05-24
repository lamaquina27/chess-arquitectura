import { useState } from "react"
import { registro } from "../api/registro_usuario"
import { useNavigate } from "react-router-dom"

function Registro() {
    const [correo, setCorreo] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const metodo = async (e) => {
        e.preventDefault()
        await registro(correo, username, password)
        navigate("/inicio")
    }

    return (
        <div className="main">
            <div className="contenedor">
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '10px', lineHeight: 1 }}>♟</div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#18181b', marginBottom: '4px', background: 'none', WebkitTextFillColor: '#18181b' }}>
                        Crear cuenta
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#71717a' }}>Únete y empieza a jugar</p>
                </div>

                <form className="formulario" onSubmit={metodo}>
                    <div>
                        <span>Correo electrónico</span>
                        <input
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            type="email"
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div>
                        <span>Usuario</span>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            placeholder="tu_usuario"
                        />
                    </div>
                    <div>
                        <span>Contraseña</span>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="••••••••"
                        />
                    </div>
                    <button className="boton" type="submit" style={{ width: '100%' }}>
                        Crear cuenta
                    </button>
                </form>

                <div style={{ textAlign: 'center', borderTop: '1px solid #e4e4e7', paddingTop: '18px' }}>
                    <span style={{ fontSize: '0.875rem', color: '#71717a' }}>¿Ya tienes cuenta? </span>
                    <button
                        onClick={() => navigate('/')}
                        style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit' }}
                    >
                        Inicia sesión
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Registro
