using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Data.SqlClient;
using System.Reflection.Metadata; // <-- Agrega este using


var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

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

        if (count > 0)
        {
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