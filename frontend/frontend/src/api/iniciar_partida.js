export async function iniciarPartida() {

  
  const response = await fetch("http://localhost:8000/partida/iniciar", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  });
  if(response.status === 401){
    return{
      error:true,status:401
    }
  }
  const data = await response.json();
  
  console.log(data)
  return data;
}