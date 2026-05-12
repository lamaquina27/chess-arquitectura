import ButtonSesion from '../components/ButtonSesion'
import { iniciarSesion } from "../api/inicio_sesion"
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Sesion() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()
    const metodo = async (e) => {

        if (username === "" || password === "") {
            alert("llene todos los campos")
            return
        }

        
        e.preventDefault()
        const data = await iniciarSesion(username, password)
        console.log(data)
        if(data.error){
            alert(data.mensaje)
                navigate("/")
                return
        }
        navigate('/inicio')
    }
    return (


        <>
            <div className="main">
                <div className="contenedor">
                    <h3>Inicio de Sesion</h3>
                    <form className="formulario" onSubmit={metodo}>
                        <span>Ingresa tu usuario</span>
                        <input value={username} onChange={(e) => setUsername(e.target.value)} type="text"></input>
                        <span>Ingresa tu Contrasena</span>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="text"></input>
                        <ButtonSesion className="boton-inicio" tipo="sesion">Inicia sesion</ButtonSesion>
                    </form>
                    <ButtonSesion className="boton-registro" tipo="registro">Aun no estas registrado?</ButtonSesion>
                    
                    <div style={{marginTop: '20px', textAlign: 'center'}}>
                        <button 
                            type="button" 
                            onClick={() => navigate('/qr-login')}
                            style={{background: 'transparent', border: '1px solid white', color: 'white', padding: '10px', borderRadius: '5px', cursor: 'pointer'}}
                        >
                            Iniciar sesión con QR (Monitor)
                        </button>
                    </div>
                </div>


            </div>
        </>

    )


}


export default Sesion