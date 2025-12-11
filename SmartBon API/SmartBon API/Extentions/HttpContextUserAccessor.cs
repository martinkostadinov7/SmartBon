using Services.Interfaces;
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
            var idStr = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idStr, out var id))
            {
                throw new Exception("invalid token!");
            }
            
             return id;
        }
    }
}
