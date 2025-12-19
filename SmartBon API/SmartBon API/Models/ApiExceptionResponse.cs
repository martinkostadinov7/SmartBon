namespace SmartBon_API.Models
{
    public class ApiErrorResponse
    {
        public required string Type { get; set; }
        public required int Status { get; set; }
        public required string Title { get; set; } = default!;
        public string? Message { get; set; }
        public DateTime Timestamp { get; set; }
    }   
}
