export async function moverPieza(casilla_inicio, casilla_llegada, pieza, id_partida, pieza_coronacion = null) {
  const body = { casilla_inicio, casilla_llegada, pieza, id_partida };
  if (pieza_coronacion) body.pieza_coronacion = pieza_coronacion;

  const response = await fetch(`/partida/mover`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  console.log(data);
  return data;
}
