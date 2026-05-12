export async function buscarUsuario(username) {
    const response = await fetch(`/api/usuario/buscar/${username}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!response.ok) return null; // Si no existe, regresamos null
    return await response.json();
}
