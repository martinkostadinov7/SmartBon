using Shared.Enums;
namespace Shared.DTOs.Users
{
    public class UserRegisterDto
    {
        public string Email { get; set; }

        public string Password { get; set; }

        public string Name { get; set; }

        public bool IsPremium { get; set; }

        public Currency DefaultCurrency { get; set; }
    }
}
