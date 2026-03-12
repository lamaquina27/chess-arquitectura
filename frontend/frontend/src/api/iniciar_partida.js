export async function iniciarPartida() {

  
  const response = await fetch("http://localhost:8000/partida/iniciar", {
    method: "POST"
  });
  const data = await response.json();


  return data;
}