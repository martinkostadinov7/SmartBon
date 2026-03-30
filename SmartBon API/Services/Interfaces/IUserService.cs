using Data.Models;
using FluentEmail.Core;
using Shared.DTOs.Users;

namespace Services.Interfaces
{
    public interface IUserService
    {
        Task<UserInfoDto> GetProfileDataAsync();

        Task<UserInfoDto> EditProfileDataAsync(UserUpdateDto dto);

        Task<bool> ChangePassword(PasswordChangeDto dto);

        Task<bool> ManagePlan(bool isPremium);

        Task<bool> ToggleMonthlyReport(bool receiveMonthlyReportEmail);

        Task<List<User>> GetAllUsersForMonthlyReportAsync();
    }
}
