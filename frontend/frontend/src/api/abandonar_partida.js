export async function abandonarPartida(id_partida) {

  // 1. Sacamos el token de la memoria del navegador
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:8000/partida/abandono", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // 2. Adjuntamos la tarjeta de identificación para pasar la seguridad del backend
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      id_partida: id_partida
    })
  });

  const data = await response.json();
  return data;
}