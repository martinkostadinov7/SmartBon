using Services.Interfaces;
using Shared.ApiExceptions;
using System.Security.Claims;

public class HttpContextUserAccessor : IUserAccessor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpContextUserAccessor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public int Id
    {
        get
        {
            var idStr = _httpContextAccessor.HttpContext?.User?.FindFirst("Id")?.Value;
            if (!int.TryParse(idStr, out var id))
            {
                throw new BadRequestException("Invalid token!");
            }
            
             return id;
        }
    }

}
