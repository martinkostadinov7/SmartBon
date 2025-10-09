using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.UserDTOs
{
    public class UserRegisterDto
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
