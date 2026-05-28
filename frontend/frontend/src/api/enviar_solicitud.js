export async function enviarSolicitud(idUsuario, idAmistad) {
    const response = await fetch(`/amistad/enviar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            id_usuario: idUsuario,
            id_amistad: idAmistad,
            estado: "pendiente" // Esto lo pide tu schema
        })
    });

    const data = await response.json();
    if (!response.ok) {
        return { error: true, mensaje: data.detail || "No se pudo enviar la solicitud." };
    }
    return data;
}
