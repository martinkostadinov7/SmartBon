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

        public int CategoryId { get; set; }

        public Category Category { get; set; }

        public int? SubcategoryId { get; set; }

        public Subcategory Subcategory { get; set; }

        public DateTime ExpenseDate { get; set; }

        public PaymentType PaymentType { get; set; }

        public Currency Currency { get; set; }

        public User User { get; set; }
        
        public int UserId { get; set; }
            
        private Expense() { }
        public Expense(string title, string? description, decimal cost, int categoryId,
            int? subCategoryId,  DateTime expenseDate, PaymentType paymentType, int userId, Currency currency)
        {
            Title = title;
            Description = description;
            Cost = cost;
            CategoryId = categoryId;
            SubcategoryId = subCategoryId;
            ExpenseDate = expenseDate;
            PaymentType = paymentType;
            UserId = userId;
            CreatedAt = DateTime.Now;
            Currency = currency;
        }
    }
}
