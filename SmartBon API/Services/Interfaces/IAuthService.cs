using Shared;
using Shared.DTOs.Users;
namespace Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginTokensDto> Login(UserLoginDto user);
        Task<LoginTokensDto> RegisterAsync(UserRegisterDto user);

        string GenerateRefreshToken();

        Task<LoginTokensDto> RefreshTokens(string refreshToken);
    }
}
