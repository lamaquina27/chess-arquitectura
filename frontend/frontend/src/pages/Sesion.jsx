import ButtonSesion from '../components/ButtonSesion'
import Button from '../components/ButtonSesion'
function Sesion(){
    
    return(


        <>
            <div className="main">
                <div className="contenedor">
                    <h3>Inicio de Sesion</h3>
                    <form className="formulario">
                        <span>Ingresa tu usuario</span>
                        <input type="text"></input>
                        <span>Ingresa tu Contrasena</span>
                        <input type="text"></input>
                        <ButtonSesion className="boton-inicio" tipo = "sesion">Inicia sesion</ButtonSesion>
                    </form>
                    <ButtonSesion className="boton-registro" tipo = "registro">Aun no estas registrado?</ButtonSesion>
                </div>


            </div>
        </>

    )


}


export default Sesion