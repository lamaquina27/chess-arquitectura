import { useNavigate } from "react-router-dom";

function ButtonSesion(props){
    const navigate = useNavigate()
    const texto = props.tipo == "sesion" ? "Inicia sesion" : "Aun no estas registrado?" 
    const metodos = async () => {
        if(props.tipo == "registro"){
            navigate("/registro-usuario")
        }else{
            
        }
    }
    return (
    <>
        <button  onClick={metodos} className="boton">
            {texto}
        </button>
        
    </>
    
  )

}

export default ButtonSesion