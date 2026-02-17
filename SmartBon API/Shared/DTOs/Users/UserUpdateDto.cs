using Shared.Enums;

namespace Shared.DTOs.Users
{
    public class UserUpdateDto
    {
        public string? Email { get; set; }

        public string? Name { get; set; }

        public Currency? DefaultCurrency { get; set; }
    }
}
