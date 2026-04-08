namespace SmartBon_API.Models
{
    /// <summary>
    /// The standard JSON payload model returned to the client whenever an API error occurs.
    /// Complies generally with RFC 7807 Problem Details for HTTP APIs.
    /// </summary>
    public class ApiErrorResponse
    {
        public required string Type { get; set; }
        public required int Status { get; set; }
        public required string Title { get; set; } = default!;
        public string? Message { get; set; }
        public DateTime Timestamp { get; set; }
    }
}