using Shared.Enums;
namespace Shared.DTOs.Users
{
    public class UserRegisterDto
    {
        public required string Email { get; set; }

        public required string Password { get; set; }

        public required string Name { get; set; }

        public required bool IsPremium { get; set; }

        public required Currency DefaultCurrency { get; set; }
    }
}
