using Shared.Enums;

namespace Data.Models
{
    public class RecurringExpense : IEntity
    {
        public int Id { get; set; }

        public string Title { get; set; }

        public string? Description { get; set; }

        public decimal Cost { get; set; }

        public int CategoryId { get; set; }

        public Category Category { get; set; }

        public int? SubcategoryId { get; set; }

        public Subcategory Subcategory { get; set; }

        public PaymentType PaymentType { get; set; }

        public Currency Currency { get; set; }

        public User User { get; set; }

        public int UserId { get; set; }

        public RecurringExpenseFrequency Frequency { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime NextExecutionDate { get; set; }

        public List<Expense> Expenses { get; set; } = new List<Expense>();

        private RecurringExpense() { }
        public RecurringExpense(string title, string? description, decimal cost, int categoryId, int? subcategoryId, 
            PaymentType paymentType, Currency currency, int userId, RecurringExpenseFrequency frequency, DateTime startDate, DateTime nextExecutionDate)
        {
            Title = title;
            Description = description;
            Cost = cost;
            CategoryId = categoryId;
            SubcategoryId = subcategoryId;
            PaymentType = paymentType;
            Currency = currency;
            UserId = userId;
            Frequency = frequency;
            StartDate = startDate;
            NextExecutionDate = nextExecutionDate;
        }
    }
}
