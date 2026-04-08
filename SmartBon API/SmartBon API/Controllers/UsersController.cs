using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs.Users;

namespace SmartBon_API.Controllers
{
    /// <summary>
    /// API endpoints for managing the authenticated user's profile, settings, and data retention.
    /// </summary>
    [Authorize]
    [Route("/api/[controller]")]
    [ApiController]
    public class UsersController(IUserService userService, IDataService dataService) : ControllerBase
    {
        /// <summary> Retrieves the profile details of the currently authenticated user. </summary>
        [HttpGet("me")]
        public async Task<ActionResult<UserInfoDto>> GetProfileData()
        {
            UserInfoDto user = await userService.GetProfileDataAsync();
            return Ok(user);
        }

        /// <summary> Updates the user's profile information. </summary>
        [HttpPost("editProfile")]
        public async Task<ActionResult<UserInfoDto>> EditProfileData(UserUpdateDto request)
        {
            UserInfoDto user = await userService.EditProfileDataAsync(request);
            return Ok(user);
        }

        /// <summary> Changes the user's account password. </summary>
        [HttpPost("changePassword")]
        public async Task<ActionResult> ChangePassword(PasswordChangeDto request)
        {
            await userService.ChangePassword(request);
            return Ok();
        }

        /// <summary> Upgrades or downgrades the user's subscription plan. </summary>
        [HttpPost("managePlan")]
        public async Task<ActionResult> ManagePlan(bool isPremium)
        {
            await userService.ManagePlan(isPremium);
            return Ok();
        }

        /// <summary> Updates the user's preferred application language. </summary>
        [HttpPost("changeLanguage")]
        public async Task<ActionResult> ChangeLanguage(string language)
        {
            await userService.ChangeLanguage(language);
            return Ok();
        }

        /// <summary> Toggles whether the user receives automated monthly report emails. </summary>
        [HttpPost("monthlyReport")]
        public async Task<ActionResult> ToggleMonthlyReport(bool receiveMonthlyReportEmail)
        {
            await userService.ToggleMonthlyReport(receiveMonthlyReportEmail);
            return Ok();
        }

        /// <summary> Clears all financial data (expenses, budgets, goals) associated with the user. </summary>
        [HttpDelete("deleteAllData")]
        public async Task<ActionResult> DeleteAllData()
        {
            await dataService.DeleteAllData();
            return Ok();
        }

        /// <summary> Permanently deletes the user's account and all associated data. </summary>
        [HttpDelete("deleteAccount")]
        public async Task<ActionResult> DeleteAccount()
        {
            await userService.DeleteAccount();
            return Ok();
        }
    }
}