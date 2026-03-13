import { useState } from 'react';
import "./Popup.css"
function Popup(props){
    const [isOpen,setOpen] = useState(true)

    return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>¿Seguro que quieres abandonar?</h2>

        <div className="botones">
          <button onClick={props.cerrar}>Cancelar</button>
          <button>Abandonar</button>
        </div>

      </div>
    </div>
  )

}
export default Popup