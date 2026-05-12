export async function moverPieza(casilla_inicio, casilla_llegada, pieza,id_partida) {
  const response = await fetch(`http://${window.location.hostname}:8000/partida/mover`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    
    body: JSON.stringify({
      casilla_inicio,
      casilla_llegada,
      pieza,
      id_partida
    })
  });
  const data = await response.json();
  console.log(data)
  return data;
}
