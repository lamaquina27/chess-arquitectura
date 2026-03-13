import { abandonarPartida } from "../api/abandonar_partida"
import PopupPerdida from "./PopupPerdida"
function ButtonConfirmacion(){
    const confirmacion =async  () => {

        const abandono = await abandonarPartida()
        
        console.log(abandono)
    }

    return(
        <>
            <button onClick={confirmacion}> Abandonar</button>
            <PopupPerdida></PopupPerdida>
        </>
    )

}

export default ButtonConfirmacion