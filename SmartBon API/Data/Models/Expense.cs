using Shared.Enums;

namespace Data.Models
{
    /// <summary>
    /// Represents a single financial transaction (expense) made by a user.
    /// </summary>
    public class Expense : IEntity
    {
        public int Id { get; set; }

        public string Title { get; set; }

        public string? Description { get; set; }

        /// <summary> The monetary value of the expense. </summary>
        public decimal Cost { get; set; }

        /// <summary> The timestamp when the record was created in the system. </summary>
        public DateTime CreatedAt { get; set; }

        public int CategoryId { get; set; }
        public Category Category { get; set; }

        public int? SubcategoryId { get; set; }
        public Subcategory Subcategory { get; set; }

        /// <summary> The actual date the expense occurred, which may differ from the creation date. </summary>
        public DateTime ExpenseDate { get; set; }

        /// <summary> The method used to pay for the expense (e.g., Cash, Card). </summary>
        public PaymentType PaymentType { get; set; }

        public Currency Currency { get; set; }

        public User User { get; set; }
        public int UserId { get; set; }

        /// <summary> Reference to the recurring expense configuration, if this expense was generated automatically. </summary>
        public RecurringExpense? RecurringExpense { get; set; }
        public int? RecurringExpenseId { get; set; }

        private Expense() { }
        public Expense(string title, string? description, decimal cost, int categoryId,
            int? subCategoryId, DateTime expenseDate, PaymentType paymentType, int userId, Currency currency, int? recurringExpenseId = null)
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
            RecurringExpenseId = recurringExpenseId;
        }
    }
}