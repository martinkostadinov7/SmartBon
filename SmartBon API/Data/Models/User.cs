using Shared.Enums;

namespace Data.Models
{
    /// <summary>
    /// Represents an application user and their account settings.
    /// </summary>
    public class User : IEntity
    {
        public int Id { get; set; }

        public string Email { get; set; }

        /// <summary> Indicates if the user has an active premium subscription. </summary>
        public bool IsPremium { get; set; } = false;

        public string Name { get; set; }

        /// <summary> The user's preferred currency for displaying financial data. </summary>
        public Currency DefaultCurrency { get; set; }

        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; }

        /// <summary> Flag indicating if the user has opted in to receive monthly financial summary emails. </summary>
        public bool ReceiveMonthlyReportEmail { get; set; }

        /// <summary> Tracks the total number of receipts the user has scanned (used for quotas or analytics). </summary>
        public int ReceiptScansCount { get; set; } = 0;

        /// <summary> The token used to refresh JWT authentication without requiring re-login. </summary>
        public string RefreshToken { get; set; } = null;

        public DateTime RefreshTokenExpiryTime { get; set; } = DateTime.Now;

        /// <summary> The user's preferred application language code. </summary>
        public string Language { get; set; }

        private User() { }
        public User(string email, string passwordHash, string name, bool isPremium, Currency defaultCurrency, bool receiveMonthlyReportEmail, string language)
        {
            Email = email;
            PasswordHash = passwordHash;
            CreatedAt = DateTime.Now;
            Name = name;
            IsPremium = isPremium;
            DefaultCurrency = defaultCurrency;
            ReceiveMonthlyReportEmail = receiveMonthlyReportEmail;
            ReceiptScansCount = 0;
            Language = language;
        }
    }
}