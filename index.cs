using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Data.SqlClient;
using System.Reflection.Metadata; // <-- Agrega este using
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies; // Necesario para AddCookie



var builder = WebApplication.CreateBuilder(args);

// Añadir el servicio de sesiones
builder.Services.AddDistributedMemoryCache(); // Necesario para almacenar las sesiones
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(20); // Tiempo de inactividad
    options.Cookie.HttpOnly = true; // Solo accesible en el lado del servidor
    options.Cookie.IsEssential = true;
});

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "GamerlogAuth";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        options.SlidingExpiration = true;
    });

builder.Services.AddAuthorization();

var app = builder.Build();
// Usar el middleware de sesiones
app.UseSession();
app.UseAuthorization();
app.UseAuthorization(); // Usa el middleware de autorización



app.UseDefaultFiles(); // Sirve index.html por defecto
app.UseStaticFiles();  // Sirve archivos estáticos (html, js, css, imágenes)

string connectionString = "Server=DESKTOP-6R4GSNU\\SQLEXPRESS;Database=Gamerlog;Uid=candela;Pwd=1234;TrustServerCertificate=True;";

app.MapPost("/login", async (HttpContext context) =>
{
    var data = await JsonSerializer.DeserializeAsync<LoginRequest>(
        context.Request.Body,
        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
    );

    if (data != null)
    {
        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        var command = new SqlCommand(
            "SELECT COUNT(*) FROM Usuarios WHERE Usuario = @usuario AND Contrasena = @contrasena",
            connection
        );
        command.Parameters.AddWithValue("@usuario", data.Usuario);
        command.Parameters.AddWithValue("@contrasena", data.Contrasena);

        int count = (int)await command.ExecuteScalarAsync();

        var command1 = new SqlCommand(
            "SELECT Correo FROM Usuarios WHERE Usuario = @usuario AND Contrasena = @contrasena",
            connection
        );

        command1.Parameters.AddWithValue("@usuario", data.Usuario);
        command1.Parameters.AddWithValue("@contrasena", data.Contrasena);
        var email = (string)await command1.ExecuteScalarAsync();

        if (!string.IsNullOrEmpty(email))
        {
            // 2. CREAR LAS CLAIMS (Identidad del usuario)
            var claims = new List<Claim>
        {
            // ClaimTypes.Name es el identificador principal para el nombre de usuario
            new Claim(ClaimTypes.Name, data.Usuario), 
            // ClaimTypes.Email es estándar para el correo
            new Claim(ClaimTypes.Email, email),
            // Puedes agregar un Claim para el rol aquí si lo obtuvieras de la DB
        };

            var claimsIdentity = new ClaimsIdentity(
                claims, CookieAuthenticationDefaults.AuthenticationScheme);

            var authProperties = new AuthenticationProperties
            {
                // IsPersistent = false: La cookie es de sesión (se borra al cerrar el navegador)
                IsPersistent = false,
            };

            // 3. ESTABLECER LA AUTENTICACIÓN (Firma la cookie)
            await context.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);
            context.Response.StatusCode = 200;
            await context.Response.WriteAsync("OK");
            return;
        }
    }


    context.Response.StatusCode = 401;
    Console.WriteLine($"El valor de la variable es: {data?.Usuario} y la contraseña es: {data?.Contrasena}");
    await context.Response.WriteAsync("Usuario o contraseña incorrectos");
});

app.MapPost("/register", async (HttpContext context) =>
{
    var data = await JsonSerializer.DeserializeAsync<LoginRequest>(
        context.Request.Body,
        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
    );

    if (data != null)
    {
        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        var checkCommand = new SqlCommand(
            "SELECT COUNT(*) FROM Usuarios WHERE Usuario = @usuario OR Correo = @correo",
            connection
        );
        checkCommand.Parameters.AddWithValue("@usuario", data.Usuario);
        checkCommand.Parameters.AddWithValue("@correo", data.Email); // Asumiendo que el correo es el mismo que el usuario

        int userExists = (int)await checkCommand.ExecuteScalarAsync();
        if (userExists > 0)
        {
            context.Response.StatusCode = 409; // Conflict
            await context.Response.WriteAsync("El usuario ya existe");
            return;
        }

        var insertCommand = new SqlCommand(
            "INSERT INTO Usuarios (Usuario, Contrasena, Correo) VALUES (@usuario, @contrasena, @correo)",
            connection
        );
        insertCommand.Parameters.AddWithValue("@usuario", data.Usuario);
        insertCommand.Parameters.AddWithValue("@contrasena", data.Contrasena);
        insertCommand.Parameters.AddWithValue("@correo", data.Email);
        Console.WriteLine($"Usuario: {data?.Usuario} contraseña: {data?.Contrasena} correo: {data?.Email}");

        int rowsAffected = await insertCommand.ExecuteNonQueryAsync();
        if (rowsAffected > 0)
        {
            context.Response.StatusCode = 201; // Created
            await context.Response.WriteAsync("Usuario registrado exitosamente");
            return;
        }
    }

    context.Response.StatusCode = 400; // Bad Request
    await context.Response.WriteAsync("Error al registrar el usuario");
});


app.MapGet("/games", async (HttpContext context) =>
{
    string apiKey = "98030a434a584555a2ff854c4a5fd74b";
    string query = context.Request.Query["search"];
    string url;

    if (string.IsNullOrWhiteSpace(query))
    {
        // Juegos populares por defecto
        url = $"https://api.rawg.io/api/games?key={apiKey}&ordering=-added&exclude_additions=true&page_size=40";
    }
    else
    {
        url = $"https://api.rawg.io/api/games?key={apiKey}&search={Uri.EscapeDataString(query)}&ordering=-added&exclude_additions=true&page_size=40";
    }

    using var httpClient = new HttpClient();

    try
    {
        var rawgResponse = await httpClient.GetStringAsync(url);
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(rawgResponse);
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsync("Error al consultar RAWG: " + ex.Message);
    }
});

app.MapGet("/game", async (HttpContext context) =>
{
    string apiKey = "98030a434a584555a2ff854c4a5fd74b";
    string id = context.Request.Query["id"];
    if (string.IsNullOrWhiteSpace(id))
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsync("Falta el id del juego.");
        return;
    }

    string url = $"https://api.rawg.io/api/games/{id}?key={apiKey}";
    using var httpClient = new HttpClient();

    try
    {
        var rawgResponse = await httpClient.GetStringAsync(url);
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(rawgResponse);
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsync("Error al consultar RAWG: " + ex.Message);
    }
});



 app.MapPost("review", async(
    HttpContext context,
    ResenaCreacionDTO resenaDto
    // [DEPENDENCIA DE BASE DE DATOS O SERVICIO]
) =>
{
    // 1. OBTENER EL USUARIO LOGUEADO
    // El middleware de autenticación ya llenó el HttpContext.User con los Claims.
    var nombreUsuario = context.User.FindFirstValue(ClaimTypes.Email);
    
    Console.WriteLine("--- NUEVA RESEÑA RECIBIDA ---");
    Console.WriteLine($"Usuario logueado (Claim): {nombreUsuario}");
    Console.WriteLine($"Texto de la Reseña (DTO): {resenaDto.Texto}");
    Console.WriteLine($"ID del Juego (DTO): {resenaDto.Juego}");
    Console.WriteLine("------------------------------");
    // Esto no debería pasar si [Authorize] funciona, pero es buena práctica verificar
    if (string.IsNullOrEmpty(nombreUsuario))
    {
        return Results.Unauthorized(); 
    }

    if (string.IsNullOrWhiteSpace(resenaDto.Texto) )
    {
        return Results.BadRequest("Faltan datos de la reseña.");
    }

    // 2. PREPARAR DATOS PARA DB
    var fechaActual = DateTime.UtcNow; // Mejor usar UTC en el servidor

    // ******************************************************************
    // ** LÓGICA DE GUARDADO EN BASE DE DATOS **
    // ******************************************************************
    Console.WriteLine("--- NUEVA RESEÑA RECIBIDA ---");
    Console.WriteLine($"Usuario logueado (Claim): {nombreUsuario}");
    Console.WriteLine($"Texto de la Reseña (DTO): {resenaDto.Texto}");
    Console.WriteLine($"ID del Juego (DTO): {resenaDto.Juego}");
    Console.WriteLine($"Fecha de Registro (Server UTC): {fechaActual}");
    Console.WriteLine("------------------------------");



    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    
    var command = new SqlCommand(
        "INSERT INTO Reviews (Creador, Resena, Fecha, Juego) VALUES (@creador, @resena, @fecha, @juego)",
        connection
    );
    command.Parameters.AddWithValue("@resena", resenaDto.Texto);
    command.Parameters.AddWithValue("@juego", resenaDto.Juego);
    command.Parameters.AddWithValue("@creador", nombreUsuario); // Usamos el nombre del Claim
    command.Parameters.AddWithValue("@fecha", fechaActual);

    await command.ExecuteNonQueryAsync();
    

    // 3. RESPUESTA EXITOSA
    // Devolvemos los datos finales (incluyendo los que generó el servidor)
    return Results.Ok(new 
    {
        Texto = resenaDto.Texto,
        JuegoId = resenaDto.Juego,
        Usuario = nombreUsuario, 
        Fecha = fechaActual.ToString("o") // "o" es formato ISO8601, fácil de leer en JS
    });
}); // Asegura que solo usuarios autenticados puedan acceder  

//Cargar Reseñas al abrir un juego
app.MapGet("/cargarReviews", async (HttpContext context) =>
{
    string juegoId = context.Request.Query["gameID"];
    
    if (string.IsNullOrWhiteSpace(juegoId))
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsync("Falta el id del juego.");
        return;
    }

    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    var command = new SqlCommand(
        "SELECT Creador, Resena, Fecha FROM Reviews WHERE Juego = @juegoId ORDER BY Fecha DESC",
        connection
    );
    command.Parameters.AddWithValue("@juegoId", juegoId);

    var reviews = new List<object>();
    using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        reviews.Add(new 
        {
            Usuario = reader.GetString(0),
            Texto = reader.GetString(1),
            Fecha = reader.GetDateTime(2).ToString("o") // Formato ISO8601
        });
    }

    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(JsonSerializer.Serialize(reviews));
});

app.Run();

public class LoginRequest
{
    [JsonPropertyName("usuario")]
    public string Usuario { get; set; }
    [JsonPropertyName("contrasena")]
    public string Contrasena { get; set; }
    [JsonPropertyName("email")]
    public string Email { get; set; }
}

public class ResenaCreacionDTO
{
    // Las mayúsculas deben coincidir con la clave JSON enviada ("Texto", "JuegoId")
    public string Texto { get; set; } 
    public int Juego { get; set; } // O int, dependiendo de cómo manejes los IDs
}