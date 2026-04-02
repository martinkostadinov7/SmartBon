using Data.Interfaces;
using Data.Models;
using Services.Interfaces;
using Shared.ApiExceptions;

public class HttpContextUserAccessor(IUserRepository userRepo, IHttpContextAccessor httpContextAccessor) : IUserAccessor
{
    public int Id
    {
        get
        {
            var idStr = httpContextAccessor.HttpContext?.User?.FindFirst("Id")?.Value;
            if (!int.TryParse(idStr, out var id))
            {
                throw new UnauthorizedException("Invalid token!");
            }
            
             return id;
        }
    }
    public async Task<User> GetUserAsync()
    {
        return await userRepo.GetByIdAsync(Id) ?? throw new NotFoundException("User not found!");
    }
}
