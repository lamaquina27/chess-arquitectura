export async function obtenerPerfil() {
    const response = await fetch(`http://${window.location.hostname}:8000/api/usuario/perfil`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    const data = await response.json();
    return data;
}
