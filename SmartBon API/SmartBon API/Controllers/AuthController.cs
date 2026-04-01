using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Services.Interfaces;
using Shared;
using Shared.DTOs.Users;

namespace SmartBon_API.Controllers
{
    [Route("/api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;

        public AuthController(IAuthService authService)
        {
            this.authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<JsonWebToken>> Login(UserLoginDto request)
        {
            var token = await authService.Login(request);

            return Ok(token);
        }

        [HttpPost("register")]
        public async Task<ActionResult<JsonWebToken>> Register([FromBody] UserRegisterDto request)
        {
            var token = await authService.RegisterAsync(request);
            return Ok(token);
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<LoginTokensDto>> Refresh([FromBody] string refreshToken)
        {
            return await authService.RefreshTokens(refreshToken);
        }
    }
}
