using System.Security.Claims;

namespace Services.Interfaces
{
    public interface IUserAccessor
    {
        int Id { get; }
        ClaimsPrincipal? User { get; }
    }
}
