using Microsoft.AspNetCore.Http;
namespace Shared.ApiExceptions
{
    public class TooManyRequestsException : ApiException
    {
        public override string Type => "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429";

        public override int Status => StatusCodes.Status429TooManyRequests;

        public override string Title => "Too Many Requests";

        public TooManyRequestsException(string message) : base(message) { }
    }
}
