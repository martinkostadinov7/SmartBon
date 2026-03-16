using Shared.Enums;
namespace Shared.DTOs.Expenses.Recurring
{
    public class RecurringExpenseCreateDto
    {
        public required string Title { get; set; }

        public string? Description { get; set; }

        public decimal Cost { get; set; }

        public int CategoryId { get; set; }

        public int? SubcategoryId { get; set; }

        public DateTime ExpenseDate { get; set; }

        public PaymentType PaymentType { get; set; }

        public Currency Currency { get; set; }

        public RecurringExpenseFrequency Frequency { get; set; }
    }
}
