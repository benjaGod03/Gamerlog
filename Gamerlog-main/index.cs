using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Data.SqlClient; // <-- Agrega este using


var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles(); // Sirve index.html por defecto
app.UseStaticFiles();  // Sirve archivos estáticos (html, js, css, imágenes)

string connectionString = "Server=DESKTOP-6R4GSNU\\SQLEXPRESS;Database=Gamerlog;Trusted_Connection=True;TrustServerCertificate=True;";

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
    await context.Response.WriteAsync("Usuario o contraseña incorrectos");
});

app.Run();

public class LoginRequest
{
    [JsonPropertyName("usuario")]
    public string Usuario { get; set; }
    [JsonPropertyName("contrasena")]
    public string Contrasena { get; set; }
}