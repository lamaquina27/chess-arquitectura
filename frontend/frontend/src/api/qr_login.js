const API_URL = `http://${window.location.hostname}:8000/api`;

export const generarQRLogin = async () => {
    try {
        const response = await fetch(`${API_URL}/qr/generate`);
        if (!response.ok) throw new Error("Error generando QR");
        return await response.json();
    } catch (error) {
        console.error(error);
        return { error: true, mensaje: error.message };
    }
};

export const verificarQRLogin = async (sala, token) => {
    try {
        const access_token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/qr/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({ sala, token })
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || "Error verificando QR");
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return { error: true, mensaje: error.message };
    }
};
