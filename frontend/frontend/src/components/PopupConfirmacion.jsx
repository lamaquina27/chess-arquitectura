import { useState } from 'react';
import "./Popup.css"
import ButtonConfirmacion from './ButtonConfirmacion';
function PopupConfirmacion(props){
    const [isOpen,setOpen] = useState(true)

    return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>¿Seguro que quieres abandonar?</h2>

        <div className="botones">
          <button onClick={props.cerrar}>Cancelar</button>
          <ButtonConfirmacion></ButtonConfirmacion>
        </div>

      </div>
    </div>
  )

}
export default PopupConfirmacion