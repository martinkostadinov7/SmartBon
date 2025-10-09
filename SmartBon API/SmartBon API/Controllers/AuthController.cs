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
        public async Task<ActionResult<JsonWebToken>> Login(UserLoginDto request)
        {
            var token = await authService.LoginAsync(request);
            return Ok(token);
        }

        [HttpPost("register")]
        public async Task<ActionResult<string>> Register(UserRegisterDto request)
        {
            await authService.RegisterAsync(request);
            return Ok("User successfully registered!");
        }
    }
}
