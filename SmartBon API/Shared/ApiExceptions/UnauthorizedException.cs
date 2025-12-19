using Microsoft.AspNetCore.Http;
namespace Shared.ApiExceptions
{
    public class UnauthorizedException : ApiException
    {
        public override string Type { get; set; } = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/401";
        public override int Status { get; } = StatusCodes.Status401Unauthorized;
        public override string Title { get; } = "Unauthorized";

        public UnauthorizedException(string message) : base(message) { }
    }
}
