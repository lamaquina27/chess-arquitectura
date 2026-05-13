import './Home.css'
import Button from '../components/Button'
function Home() {
    return (

        <>
            <div className='main'>
                <div className='cont'>
                    <h1>
                        Bienvenidos a cheesse
                    </h1>
                    <Button funcion="iniciar"></Button>
                    <Button funcion="invitar_qr"></Button>
                    <Button funcion="perfil"></Button>
                    <Button funcion="cerrar_sesion"></Button>
                </div>
            </div>

        </>
    )

}
export default Home