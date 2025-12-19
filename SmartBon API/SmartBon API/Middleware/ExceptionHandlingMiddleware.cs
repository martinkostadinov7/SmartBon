using Shared.ApiExceptions;
using SmartBon_API.Models;
using System.Text.Json;
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {

            var errorResponse = CreateErrorResponse(context, ex);

            if (errorResponse.Status == 500) _logger.LogError(ex, "Unhandled exception occurred");

            else _logger.LogError(ex, errorResponse.Message);

            context.Response.StatusCode = errorResponse.Status;
            context.Response.ContentType = "application/json";

            var json = JsonSerializer.Serialize(errorResponse, _jsonOptions);

            await context.Response.WriteAsync(json);
        }
    }

    private ApiErrorResponse CreateErrorResponse(HttpContext context, Exception ex)
    {
        if (ex is ApiException apiEx)
        {
            return new ApiErrorResponse
            {
                Type = apiEx.Type,
                Status = apiEx.Status,
                Title = apiEx.Title,
                Message = apiEx.Message,
                Timestamp = DateTime.UtcNow
            };
        }

        return new ApiErrorResponse
        {
            Type = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/500",
            Status = StatusCodes.Status500InternalServerError,
            Title = "Internal Server Error",
            Message = _env.IsProduction() ? null : ex.ToString(),
            Timestamp = DateTime.UtcNow
        };
    }
}