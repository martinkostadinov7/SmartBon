using Shared.DTOs.CategoryDTOs;
using Shared.DTOs.UserDTOs;

namespace Services.Interfaces
{
    public interface IUserService
    {
        Task<UserInfoDto> GetProfileDataAsync();

        Task<UserInfoDto> EditProfileDataAsync(UserUpdateDto dto);
    }
}
