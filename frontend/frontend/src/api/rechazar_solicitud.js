export async function rechazarSolicitud(idUsuario, idAmistad) {
    const response = await fetch(`http://${window.location.hostname}:8000/amistad/rechazar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            id_usuario: idUsuario,
            id_amistad: idAmistad,
            estado: "rechazada"
        })
    });
    return response.ok;
}
