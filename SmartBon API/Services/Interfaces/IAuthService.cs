using Shared.DTOs.Users;

namespace Services.Interfaces
{
    /// <summary>
    /// Service for managing user authentication, login, registration, and tokens.
    /// </summary>
    public interface IAuthService
    {
        /// <summary> Authenticates a user and returns login tokens. </summary>
        Task<LoginTokensDto> Login(UserLoginDto user);

        /// <summary> Registers a new user and returns login tokens upon successful creation. </summary>
        Task<LoginTokensDto> RegisterAsync(UserRegisterDto user);

        /// <summary> Generates a new, secure refresh token string. </summary>
        string GenerateRefreshToken();

        /// <summary> Refreshes the access token using a valid refresh token. </summary>
        Task<LoginTokensDto> RefreshTokens(string refreshToken);
    }
}