export const obtenerMovimientos = async (partida_id, casilla) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(
            `/partida/movimientos?partida_id=${partida_id}&casilla=${casilla}`,
            {
                headers: { "Authorization": `Bearer ${token}` }
            }
        );

        if (!response.ok) return [];

        const data = await response.json();
        return data.casillas ?? [];

    } catch {
        return [];
    }
};