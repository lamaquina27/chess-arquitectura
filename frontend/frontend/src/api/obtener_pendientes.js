export async function obtenerPendientes(mi_id) {
    const response = await fetch(`/amistad/pendientes/${mi_id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });
    if (!response.ok) return [];
    return await response.json();
}
