export async function iniciarMutijugador(username_enemigo, password_enemigo) {
    // Sacamos el token del jugador principal
    const token = localStorage.getItem("token");

    // Enviamos credenciales del enemigo y token del anfitrión
    const response = await fetch("http://localhost:8000/partida/iniciar_multijugador", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            username: username_enemigo,
            password: password_enemigo
        })
    });

    // Atrapamos CUALQUIER tipo de error que mande Python (sea 401, 400 o el que sea)
    if (!response.ok) {
        // Leemos la respuesta de error de FastAPI
        const errorData = await response.json();
        return {
            error: true,
            // FastAPI siempre manda el mensaje de error dentro de la propiedad "detail"
            mensaje: errorData.detail || "Error desconocido al iniciar partida"
        };
    }


    const data = await response.json();
    return data;
}
