using Shared.Enums;

namespace Shared.DTOs.Users
{
    public class UserInfoDto
    {
        public string Email { get; set; }

        public bool IsPremium { get; set; } = false;

        public string Name { get; set; }

        public Currency DefaultCurrency { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
