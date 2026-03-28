using Shared.Enums;

namespace Data.Models
{
    public class User : IEntity
    {
        public int Id { get; set; }
        
        public string Email { get; set; }

        public bool IsPremium { get; set; } = false;

        public string Name { get; set; }

        public Currency DefaultCurrency { get; set; }

        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; }

        public bool ReceiveMonthlyReportEmail { get; set; }

        public int ReceiptScansCount { get; set; } = 0;

        private User() { }
        public User(string email, string passwordHash, string name, bool isPremium, Currency defaultCurrency, bool receiveMonthlyReportEmail)
        {
            Email = email;
            PasswordHash = passwordHash;
            CreatedAt = DateTime.Now;
            Name = name;
            IsPremium = isPremium;
            DefaultCurrency = defaultCurrency;
            ReceiveMonthlyReportEmail = receiveMonthlyReportEmail;
            ReceiptScansCount = 0;
        }
    }
}
