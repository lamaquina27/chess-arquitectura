import { useState } from "react";
import { registro } from "../api/registro_usuario"
import { useNavigate } from "react-router-dom";

function Registro(){
    const [email,setEmail] = useState()
    const [username,setUsername] = useState()
    const [password,setPassword] = useState()
    const navigate = useNavigate()
    const metodo = async () =>{
        console.log("holaaa")
        registro()
        navigate("/inicio")
        
    }
    return (
        <>
            <div className="main">
                <div className="contenedor">
                    <h3>Inicio de Sesion</h3>
                    <form className="formulario">
                        <span>Ingresa tu correo</span>
                        <input type="text"></input>
                        <span>Ingresa tu usuario</span>
                        <input type="text"></input>
                        <span>Ingresa tu Contrasena</span>
                        <input type="text"></input>
                        <button className="boton-inicio" onClick={metodo}>registrate</button>
                    </form>
                    
                </div>


            </div>
            
        
        
        </>
    )

}

export default Registro