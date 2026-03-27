import ButtonSesion from '../components/ButtonSesion'
import { iniciarSesion } from "../api/inicio_sesion"
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Sesion(){
    const [username,setUsername] = useState("")
    const [password,setPassword] = useState("")
    const navigate = useNavigate()
    const metodo = async (e) =>{
        e.preventDefault()
        await iniciarSesion(username,password)
        navigate('/inicio')
    }
    return(


        <>
            <div className="main">
                <div className="contenedor">
                    <h3>Inicio de Sesion</h3>
                    <form className="formulario" onSubmit={metodo}>
                        <span>Ingresa tu usuario</span>
                        <input value={username} onChange={(e) => setUsername(e.target.value)}type="text"></input>
                        <span>Ingresa tu Contrasena</span>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="text"></input>
                        <ButtonSesion className="boton-inicio" tipo = "sesion">Inicia sesion</ButtonSesion>
                    </form>
                    <ButtonSesion className="boton-registro" tipo = "registro">Aun no estas registrado?</ButtonSesion>
                </div>


            </div>
        </>

    )


}


export default Sesion