using Microsoft.AspNetCore.Http;
namespace Shared.ApiExceptions
{
    public class BadRequestException : ApiException
    {
        public override string Type => "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/400";

        public override int Status => StatusCodes.Status400BadRequest;
        public override string Title => "Bad Request";

        public BadRequestException(string message) : base(message) { }
    }
}
