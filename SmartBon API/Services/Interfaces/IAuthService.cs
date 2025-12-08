using Shared;
using Shared.DTOs.UserDTOs;

namespace Services.Interfaces
{
    public interface IAuthService
    {
        JsonWebToken LoginAsync(UserLoginDto user);
        Task RegisterAsync(UserRegisterDto user);
    }
}
