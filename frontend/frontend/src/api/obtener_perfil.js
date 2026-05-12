export async function obtenerPerfil() {
    const response = await fetch(`/api/usuario/perfil`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    const data = await response.json();
    return data;
}
