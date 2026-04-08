using Data.Models;
using Shared.DTOs.Users;

namespace Services.Interfaces
{
    /// <summary>
    /// Service for managing user profiles, preferences, and account settings.
    /// </summary>
    public interface IUserService
    {
        /// <summary> Retrieves the profile information for the current user. </summary>
        Task<UserInfoDto> GetProfileDataAsync();

        /// <summary> Updates the profile details (e.g., name, currency) for the current user. </summary>
        Task<UserInfoDto> EditProfileDataAsync(UserUpdateDto dto);

        /// <summary> Changes the current user's password securely. </summary>
        Task<bool> ChangePassword(PasswordChangeDto dto);

        /// <summary> Upgrades or downgrades the user's subscription plan (Premium/Standard). </summary>
        Task<bool> ManagePlan(bool isPremium);

        /// <summary> Toggles the user's preference for receiving monthly automated financial reports. </summary>
        Task<bool> ToggleMonthlyReport(bool receiveMonthlyReportEmail);

        /// <summary> Retrieves a list of all users who have opted in to receive monthly reports. </summary>
        Task<List<User>> GetAllUsersForMonthlyReportAsync();

        /// <summary> Permanently deletes the current user's account and schedules their data for removal. </summary>
        Task<bool> DeleteAccount();

        /// <summary> Changes the user's preferred application language. </summary>
        Task<bool> ChangeLanguage(string language);
    }
}