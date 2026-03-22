using Data.Models;
using Services.Interfaces;
using Shared.ApiExceptions;

public class HttpContextUserAccessor(IUserService userService, IHttpContextAccessor httpContextAccessor) : IUserAccessor
{
    public int Id
    {
        get
        {
            var idStr = httpContextAccessor.HttpContext?.User?.FindFirst("Id")?.Value;
            if (!int.TryParse(idStr, out var id))
            {
                throw new BadRequestException("Invalid token!");
            }
            
             return id;
        }
    }
    public async Task<User> GetUserAsync()
    {
        return await userService.GetUserById(Id);
    }
}
