namespace Shared.DTOs
{
    public class ExportFileResultDto
    {
        public required byte[] Content { get; set; }
        public required string ContentType { get; set; }
        public required string FileName { get; set; }
    }
}
