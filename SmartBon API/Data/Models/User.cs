namespace Data.Models
{
    public class User : IEntity
    {
        public int Id { get; set; }
        

        public string Email { get; set; }

        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; }

        private User() { }
        public User(string email, string passwordHash)
        {
            Email = email;
            PasswordHash = passwordHash;
            CreatedAt = DateTime.Now;
        }
    }
}
