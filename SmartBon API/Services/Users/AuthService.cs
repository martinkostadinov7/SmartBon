using Data.Interfaces;
using Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Services.Interfaces;
using Shared;
using Shared.ApiExceptions;
using Shared.DTOs.Users;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Services.UserServices
{
    /// <inheritdoc />
    public class AuthService(IUserRepository userRepo, IConfiguration configuration) : IAuthService         
    {
        /// <inheritdoc />
        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        /// <inheritdoc />
        public async Task<LoginTokensDto> Login(UserLoginDto userToLogin)
        {
            User? user = userRepo.GetByEmail(userToLogin.Email);

            if (user == null || new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, userToLogin.Password) == PasswordVerificationResult.Failed)
            {
                throw new UnauthorizedException("Invlid credentials!");
            }

            var refreshToken = GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(30);
            await userRepo.UpdateAsync(user);

            var jwt = CreateJwtToken(user);
            LoginTokensDto loginTokensDto = new LoginTokensDto();
            loginTokensDto.JsonWebToken = jwt;
            loginTokensDto.RefreshToken = refreshToken;
            return loginTokensDto;
        }

        /// <inheritdoc />
        public async Task<LoginTokensDto> RefreshTokens(string refreshToken)
        {
            if (refreshToken == null) throw new BadRequestException("Invalid client request");

            var user = await userRepo.GetByRefreshToken(refreshToken);
            if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                throw new UnauthorizedException("Refresh token expired or invalid");
            }

            var newAccessToken = CreateJwtToken(user);

            await userRepo.UpdateAsync(user);
            LoginTokensDto loginTokensDto = new LoginTokensDto();
            loginTokensDto.JsonWebToken = newAccessToken;
            loginTokensDto.RefreshToken = refreshToken;
            return loginTokensDto;
        }

        /// <inheritdoc />
        public async Task<LoginTokensDto> RegisterAsync(UserRegisterDto userToRegister)
        {
            User? userFromDb = userRepo.GetByEmail(userToRegister.Email);
            
            if (userFromDb != null)
                throw new BadRequestException("User with this email already exists");
            
            User user = new User(userToRegister.Email, "temp", userToRegister.Name, userToRegister.IsPremium ,userToRegister.DefaultCurrency, true, "en");

            string hashedPassword = new PasswordHasher<User>().HashPassword(user, userToRegister.Password);
            user.PasswordHash = hashedPassword;
            var refreshToken = GenerateRefreshToken();
            var jwt = CreateJwtToken(user);

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(30);
            await userRepo.AddAsync(user);

            LoginTokensDto loginTokensDto = new LoginTokensDto();
            loginTokensDto.JsonWebToken = jwt;
            loginTokensDto.RefreshToken = refreshToken;
            return loginTokensDto;
        }

        /// <inheritdoc />
        private JsonWebToken CreateJwtToken(User user) 
        {
            var claims = new List<Claim>
            {
                new Claim("Email", user.Email),
                new Claim("Id", user.Id.ToString()),
                new Claim("Name", user.Name),
                new Claim("IsPremium", user.IsPremium.ToString()),
                new Claim("Currency", user.DefaultCurrency.ToString())
            };

            var tokenValue = configuration["AppSettings:Token"] ?? throw new InvalidOperationException("Token value is missing in AppSettings.");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenValue));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            DateTime expires = DateTime.UtcNow.AddMinutes(1);

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
