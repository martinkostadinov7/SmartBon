using AutoMapper;
using Data.Interfaces;
using Data.Models;
using Microsoft.AspNetCore.Identity;
using Services.Interfaces;
using Shared.ApiExceptions;
using Shared.DTOs.Users;
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
                    throw new BadRequestException("A user with this email already has an account!");
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

        public async Task<bool> ChangePassword(PasswordChangeDto dto)
        {
            string oldPassword = dto.OldPassword;
            string newPassword = dto.NewPassword;

            if (oldPassword == newPassword)
            {
                throw new BadRequestException("New password should not be identical to the old one!");
            }
            User userFromDb = await userRepo.GetByIdAsync(user.Id) ?? throw new NotFoundException($"User was not found");
            if (new PasswordHasher<User>().VerifyHashedPassword(userFromDb, userFromDb.PasswordHash, oldPassword) == PasswordVerificationResult.Failed)
            {
                throw new BadRequestException("Old password is wrong!");
            }

            string hashedPassword = new PasswordHasher<User>().HashPassword(userFromDb, newPassword);
            userFromDb.PasswordHash = hashedPassword;
            await userRepo.UpdateAsync(userFromDb);
            return true;
        }

        public async Task<bool> ManagePlan(bool isPremium)
        {
            User userFromDb = await userRepo.GetByIdAsync(user.Id) ?? throw new NotFoundException($"User was not found");
            if (userFromDb.IsPremium && !isPremium)
            {
                userFromDb.ReceiptScansCount = 0;
            }
            userFromDb.IsPremium = isPremium;
            await userRepo.UpdateAsync(userFromDb);
            return true;
        }

        public async Task<List<User>> GetAllUsersForMonthlyReportAsync()
        {
            List<User> users = await userRepo.GetAllAsync();
            return users.Where(u => u.ReceiveMonthlyReportEmail == true && u.IsPremium == true).ToList();
        }

        public async Task<bool> ToggleMonthlyReport(bool receiveMonthlyReportEmail)
        {
            User userFromDb = await userRepo.GetByIdAsync(user.Id) ?? throw new NotFoundException("User was not found");
            userFromDb.ReceiveMonthlyReportEmail = receiveMonthlyReportEmail;
            await userRepo.UpdateAsync(userFromDb);
            return true;
        }

    }
}
