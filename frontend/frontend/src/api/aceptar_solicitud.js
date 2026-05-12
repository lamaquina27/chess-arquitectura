export async function aceptarSolicitud(idUsuario, idAmistad) {
    const response = await fetch(`http://${window.location.hostname}:8000/amistad/aceptar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            id_usuario: idUsuario,
            id_amistad: idAmistad,
            estado: "aceptada"
        })
    });
    return response.ok;
}
