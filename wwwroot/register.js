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
    Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Tu cuenta fue creada correctamente. Ahora puedes iniciar sesión.',
        background: '#f3e9ff',        
        color: '#4b0082',             
        iconColor: '#9b5de5',         
        confirmButtonColor: '#9b5de5',
        confirmButtonText: 'Continuar',
        customClass: {
            popup: 'swal-custom',     
        }
    }).then(() => window.location.href = 'index.html');
} else {
    Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: 'Por favor, inténtalo de nuevo.',
        background: '#f3e9ff',
        color: '#4b0082',
        iconColor: '#d33',            
        confirmButtonColor: '#9b5de5',
        confirmButtonText: 'Entendido'
    });
    
}
}