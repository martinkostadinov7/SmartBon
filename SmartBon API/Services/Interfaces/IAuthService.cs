using Shared;
using Shared.DTOs.UserDTOs;

namespace Services.Interfaces
{
    public interface IAuthService
    {
        Task<JsonWebToken> LoginAsync(UserLoginDto user);
        Task RegisterAsync(UserRegisterDto user);
    }
}
