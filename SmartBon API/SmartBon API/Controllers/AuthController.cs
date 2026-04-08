using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs.Users;

namespace SmartBon_API.Controllers
{
    /// <summary>
    /// API endpoints for managing user authentication, registration, and token lifecycle.
    /// </summary>
    [Route("/api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;

        public AuthController(IAuthService authService)
        {
            this.authService = authService;
        }

        /// <summary> Authenticates a user and returns a JWT access and refresh token. </summary>
        [HttpPost("login")]
        public async Task<ActionResult<LoginTokensDto>> Login(UserLoginDto request)
        {
            var token = await authService.Login(request);
            return Ok(token);
        }

        /// <summary> Registers a new user account and returns initial authentication tokens. </summary>
        [HttpPost("register")]
        public async Task<ActionResult<LoginTokensDto>> Register([FromBody] UserRegisterDto request)
        {
            var token = await authService.RegisterAsync(request);
            return Ok(token);
        }

        /// <summary> Generates a new access token using a valid refresh token. </summary>
        [HttpPost("refresh")]
        public async Task<ActionResult<LoginTokensDto>> Refresh([FromBody] string refreshToken)
        {
            return await authService.RefreshTokens(refreshToken);
        }

        /// <summary> A simple test endpoint to verify API reachability. </summary>
        [HttpGet("test")]
        public async Task<ActionResult> Test()
        {
            return Ok("Test was successful");
        }
    }
}