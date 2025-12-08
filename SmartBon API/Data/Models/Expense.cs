using Shared.Enums;
namespace Data.Models
{
    public class Expense : IEntity
    {
        public int Id { get; set; }

        public string Title { get; set; }
        
        public string? Description { get; set; }
        
        public decimal Cost { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime ExpenseDate { get; set; }

        public PaymentType PaymentType { get; set; }

        public User User { get; set; }
        
        public int UserId { get; set; }
            
        private Expense() { }
        public Expense(string title, string? description, decimal cost, DateTime expenseDate, PaymentType paymentType, int userId)
        {
            Title = title;
            Description = description;
            Cost = cost;
            ExpenseDate = expenseDate;
            PaymentType = paymentType;
            UserId = userId;
            CreatedAt = DateTime.Now;
        }
    }
}
