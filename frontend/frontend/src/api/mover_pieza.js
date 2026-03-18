export async function moverPieza(casilla_inicio, casilla_llegada, pieza) {
  const response = await fetch("http://localhost:8000/partida/mover", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      casilla_inicio,
      casilla_llegada,
      pieza
    })
  });
  const data = await response.json();
  console.log(data)
  return data;
}
