using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs.Users;

namespace SmartBon_API.Controllers
{
    [Authorize]
    [Route("/api/[controller]")]
    [ApiController]
    public class UsersController(IUserService userService) : ControllerBase
    {
        [HttpGet("me")]
        public async Task<ActionResult<UserInfoDto>> GetProfileData()
        {
            UserInfoDto user = await userService.GetProfileDataAsync();

            return Ok(user);
        }

        [HttpPost("editProfile")]
        public async Task<ActionResult<UserInfoDto>> EditProfileData(UserUpdateDto request)
        {
            UserInfoDto user = await userService.EditProfileDataAsync(request);

            return Ok(user);
        }

        [HttpPost("changePassword")]
        public async Task<ActionResult> EditProfileData(PasswordChangeDto request)
        {
            await userService.ChangePassword(request);
            return Ok();
        }

        [HttpPost("managePlan")]
        public async Task<ActionResult> ManagePlan(bool isPremium)
        {
            await userService.ManagePlan(isPremium);
            return Ok();
        }
    }
}
