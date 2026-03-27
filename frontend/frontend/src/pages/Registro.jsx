import { useState } from "react";
import { registro } from "../api/registro_usuario"
import { useNavigate } from "react-router-dom";

function Registro(){
    const [correo,setCorreo] = useState("")
    const [username,setUsername] = useState("")
    const [password,setPassword] = useState("")
    const navigate = useNavigate()
    const metodo = async (e) =>{
        e.preventDefault()
        await registro(correo,username,password)
        
        navigate("/inicio")
        
    }
    return (
        <>
            <div className="main">
                <div className="contenedor">
                    <h3>Inicio de Sesion</h3>
                    <form className="formulario" onSubmit={metodo}>
                        <span>Ingresa tu correo</span>
                        <input value={correo} onChange={(e) => setCorreo(e.target.value)} type="text"></input>
                        <span>Ingresa tu usuario</span>
                        <input value={username} onChange={(e) => setUsername(e.target.value)} type="text"></input>
                        <span>Ingresa tu Contrasena</span>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="text"></input>
                        <button className="boton-inicio" type="submit">registrate</button>
                    </form>
                    
                </div>


            </div>
            
        
        
        </>
    )

}

export default Registro