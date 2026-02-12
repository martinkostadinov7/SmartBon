using Shared.DTOs.UserDTOs;

namespace Services.Interfaces
{
    public interface IUserService
    {
        Task<UserInfoDto> GetProfileDataAsync();

        Task<UserInfoDto> EditProfileDataAsync(UserUpdateDto dto);

        Task<bool> ChangePassword(PasswordChangeDto dto);
        Task<bool> ManagePlan(bool isPremium);
    }
}
