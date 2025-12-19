using Microsoft.AspNetCore.Http;

namespace Shared.ApiExceptions
{
    public class NotFoundException : ApiException
    {
        public override string Type => "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/404";
        public override int Status => StatusCodes.Status404NotFound;
        public override string Title => "Resource Not Found";

        public NotFoundException(string message) : base(message) { }
    }
}
