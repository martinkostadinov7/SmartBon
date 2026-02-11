using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs.UserDTOs;

namespace SmartBon_API.Controllers
{
    [Route("/api/[controller]")]
    [ApiController]
    public class UsersController(IUserService userService) : ControllerBase
    {
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserInfoDto>> GetProfileData()
        {
            UserInfoDto user = await userService.GetProfileDataAsync();

            return Ok(user);
        }

        [HttpPost("editProfile")]
        [Authorize]
        public async Task<ActionResult<UserInfoDto>> EditProfileData(UserUpdateDto request)
        {
            UserInfoDto user = await userService.EditProfileDataAsync(request);

            return Ok(user);
        }
    }
}
