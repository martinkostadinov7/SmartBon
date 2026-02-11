using AutoMapper;
using Data.Interfaces;
using Data.Models;
using Services.Interfaces;
using Shared.ApiExceptions;
using Shared.DTOs.UserDTOs;
using Shared.Enums;
namespace Services.Users
{
    public class UserService(IUserAccessor user, IUserRepository userRepo, IMapper mapper) : IUserService
    {
        public async Task<UserInfoDto> EditProfileDataAsync(UserUpdateDto dto)
        {
            User userToUpdate = await userRepo.GetByIdAsync(user.Id) ?? throw new NotFoundException("The logged user does not exist anymore!");
            string? newEmail = dto.Email;
            string? newName = dto.Name;
            Currency? newCurrency = dto.DefaultCurrency;
            if (newEmail != userToUpdate.Email)
            {
                User? userFromDb = userRepo.GetByEmail(newEmail);
                if (userFromDb != null)
                {
                    throw new BadRequestException("A user with tihs email already has an account!");
                }
            }
            
            userToUpdate.Email = newEmail ?? userToUpdate.Email;
            userToUpdate.Name = newName ?? userToUpdate.Name;
            userToUpdate.DefaultCurrency = newCurrency ?? userToUpdate.DefaultCurrency;
            
            await userRepo.UpdateAsync(userToUpdate);
            return mapper.Map<UserInfoDto>(userToUpdate);
        }

        public async Task<UserInfoDto> GetProfileDataAsync()
        {
            User userFromDb = await userRepo.GetByIdAsync(user.Id) ?? throw new NotFoundException($"User was not found");

            UserInfoDto userInfo = mapper.Map<UserInfoDto>(userFromDb);
            return userInfo;
        }
    }
}
