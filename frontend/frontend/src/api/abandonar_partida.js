export async function abandonarPartida() {

  
  const response = await fetch("http://localhost:8000/partida/abandono", {
    method: "POST"
  });
  const data = await response.json();


  return data;
}