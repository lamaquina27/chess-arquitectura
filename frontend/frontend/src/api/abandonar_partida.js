export async function abandonarPartida(id_partida) {


  const response = await fetch("http://localhost:8000/partida/abandono", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id_partida: id_partida
    })
  });

  const data = await response.json();


  return data;
}