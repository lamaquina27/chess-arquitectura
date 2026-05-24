import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { iniciarSesion } from "../api/inicio_sesion"

function Sesion() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const metodo = async (e) => {
        e.preventDefault()
        if (!username || !password) {
            setError("Completa todos los campos.")
            return
        }
        setError("")
        const data = await iniciarSesion(username, password)
        if (data.error) {
            setError(data.mensaje || "Credenciales incorrectas.")
            return
        }
        navigate('/inicio')
    }

    return (
        <div className="main">
            <div className="contenedor">
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '10px', lineHeight: 1 }}>♟</div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#18181b', marginBottom: '4px', background: 'none', WebkitTextFillColor: '#18181b' }}>
                        Bienvenido de vuelta
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#71717a' }}>Inicia sesión en tu cuenta</p>
                </div>

                <form className="formulario" onSubmit={metodo}>
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
                    {error && (
                        <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                            {error}
                        </p>
                    )}
                    <button className="boton" type="submit" style={{ width: '100%' }}>
                        Iniciar sesión
                    </button>
                </form>

                <div style={{ textAlign: 'center', borderTop: '1px solid #e4e4e7', paddingTop: '18px' }}>
                    <span style={{ fontSize: '0.875rem', color: '#71717a' }}>¿No tienes cuenta? </span>
                    <button
                        onClick={() => navigate('/registro-usuario')}
                        style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit' }}
                    >
                        Regístrate
                    </button>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/qr-login')}
                        style={{ background: 'none', border: '1px solid #e4e4e7', color: '#71717a', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', transition: 'all 0.15s' }}
                    >
                        📱 Iniciar con QR (Monitor)
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Sesion
