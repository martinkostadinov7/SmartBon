using Microsoft.AspNetCore.Http;

namespace Shared.ApiExceptions
{
    public abstract class ApiException : Exception
    {
        public virtual string Type { get; set; } = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/500";
        public virtual int Status { get; } = StatusCodes.Status500InternalServerError;
        public virtual string Title { get; } = "Internal Server Error"; 

        protected ApiException(string message) : base(message) { }
    }
}
