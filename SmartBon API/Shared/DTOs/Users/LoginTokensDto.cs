namespace Shared.DTOs.Users
{
    public class LoginTokensDto
    {
        public JsonWebToken JsonWebToken { get; set; }

        public string RefreshToken { get; set; }
    }
}
