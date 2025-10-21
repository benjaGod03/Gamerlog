document.getElementById('registerForm').onsubmit = async function(e) {
    e.preventDefault();
    const usuario = document.getElementById('registerUser').value;
    const contrasena = document.getElementById('registerPass').value;
    const email = document.getElementById('registerEmail').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena, email })
    });

    if (response.ok) {
        // Registro exitoso
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        window.location.href = 'index.html';
    }
    else { alert("Error en el registro. Inténtalo de nuevo."); }
    
};