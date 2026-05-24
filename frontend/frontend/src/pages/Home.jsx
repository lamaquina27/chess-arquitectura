import { useEffect, useState } from 'react'
import Button from '../components/Button'
import { obtenerPerfil } from '../api/obtener_perfil'
import './Home.css'

function Home() {
    const [perfil, setPerfil] = useState(null)

    useEffect(() => {
        obtenerPerfil().then(data => setPerfil(data))
    }, [])

    const inicial = perfil?.username?.charAt(0).toUpperCase() || '?'

    return (
        <div className="home-page">
            <header className="home-header">
                <div className="home-header-inner">
                    <div className="home-logo">
                        <span className="home-logo-icon">♟</span>
                        <span className="home-logo-text">Chesse</span>
                    </div>
                    {perfil && (
                        <div className="home-user-area">
                            <div className="home-user-info">
                                <p className="home-user-name">{perfil.username}</p>
                                <p className="home-user-elo">{perfil.elo} ELO</p>
                            </div>
                            <div className="home-avatar">{inicial}</div>
                        </div>
                    )}
                </div>
            </header>

            <main className="home-main">
                <div className="home-card">
                    <p className="home-card-label">Jugar</p>
                    <h2 className="home-play-title">¿Listo para una partida?</h2>
                    <div className="home-btns">
                        <Button funcion="iniciar" />
                        <Button funcion="invitar_qr" />
                    </div>
                </div>

                <div className="home-grid">
                    <div className="home-card">
                        <div>
                            <p className="home-card-label">Tu cuenta</p>
                            <p className="home-card-title">Perfil y amigos</p>
                        </div>
                        <Button funcion="perfil" />
                    </div>
                    <div className="home-card">
                        <div>
                            <p className="home-card-label">Sesión</p>
                            <p className="home-card-title">Cerrar sesión</p>
                        </div>
                        <Button funcion="cerrar_sesion" />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Home
