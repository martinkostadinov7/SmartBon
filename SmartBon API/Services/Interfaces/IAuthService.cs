using Shared;
using Shared.DTOs.Users;
namespace Services.Interfaces
{
    public interface IAuthService
    {
        JsonWebToken Login(UserLoginDto user);
        Task<JsonWebToken> RegisterAsync(UserRegisterDto user);
    }
}
