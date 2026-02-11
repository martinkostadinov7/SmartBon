using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared;
using Shared.DTOs.UserDTOs;

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
        public ActionResult<JsonWebToken> Login(UserLoginDto request)
        {
            var token = authService.Login(request);

            return Ok(token);
        }

        [HttpPost("register")]
        public async Task<ActionResult<JsonWebToken>> Register([FromBody] UserRegisterDto request)
        {
            var token = await authService.RegisterAsync(request);
            return Ok(token);
        }
    }
}
