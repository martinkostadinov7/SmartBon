using Data.Interfaces;
using Data.Models;
using Data.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Services.Interfaces;
using Shared;
using Shared.DTOs.UserDTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Services.UserServices
{
    public class AuthService(IUserRepository userRepo, IConfiguration configuration) : IAuthService
    {
        public async Task<JsonWebToken> LoginAsync(UserLoginDto userToLogin)
        {
            User user = userRepo.GetByEmail(userToLogin.Email) ?? throw new NullReferenceException("User with this email doesnt exist!");

            if (user == null || new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, userToLogin.Password) == PasswordVerificationResult.Failed)
            {
                throw new UnauthorizedAccessException("Invlid credentials!");
            }

            return CreateToken(user);
        }

        public async Task RegisterAsync(UserRegisterDto userToRegister)
        {
            User? userFromDb = userRepo.GetByEmail(userToRegister.Email);
            
            if (userFromDb != null)
            {
                throw new ArgumentException("User with this email already has an account!");
            }

            User user = new User(userToRegister.Email, "temp");

            string hashedPassword = new PasswordHasher<User>().HashPassword(user, userToRegister.Password);
            user.PasswordHash = hashedPassword;
            //to do email legit checker + password checker
            await userRepo.Add(user);
        }

        private JsonWebToken CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var tokenValue = configuration["AppSettings:Token"] ?? throw new InvalidOperationException("Token value is missing in AppSettings.");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenValue));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            DateTime expires = DateTime.UtcNow.AddMinutes(30);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: configuration["AppSettings:Issuer"],
                audience: configuration["AppSettings:Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
                );

            string token = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
            return new JsonWebToken
            {
                Value = token,
                ExpiresAt = expires
            };
        }
    }
}
