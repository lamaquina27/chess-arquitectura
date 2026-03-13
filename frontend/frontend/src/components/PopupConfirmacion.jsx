import { useState } from 'react';
import "./Popup.css"
import { abandonarPartida } from "../api/abandonar_partida"

import ButtonConfirmacion from './ButtonConfirmacion';
import PopupPerdida from './PopupPerdida';
function PopupConfirmacion(props){
    const [isOpen,setOpen] = useState(false)
    const metodos = async () => {
        const abandono = await abandonarPartida()
        
        console.log(abandono)
        setOpen(true)
    };
    return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>¿Seguro que quieres abandonar?</h2>

        <div className="botones">
          <button onClick={props.cerrar}>Cancelar</button>
          <ButtonConfirmacion onClick={metodos}></ButtonConfirmacion>
          {isOpen && <PopupPerdida/>}
        </div>

      </div>
    </div>
  )

}
export default PopupConfirmacion