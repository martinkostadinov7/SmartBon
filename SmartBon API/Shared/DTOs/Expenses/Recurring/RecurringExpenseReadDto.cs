using Shared.Enums;

namespace Shared.DTOs.Expenses.Recurring
{
    public class RecurringExpenseReadDto
    {
        public int Id { get; set; }

        public string Title { get; set; }

        public string? Description { get; set; }

        public decimal Cost { get; set; }

        public int CategoryId { get; set; }

        public int? SubcategoryId { get; set; }

        public PaymentType PaymentType { get; set; }

        public Currency Currency { get; set; }

        public int UserId { get; set; }

        public RecurringExpenseFrequency Frequency { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime NextExecutionDate { get; set; }

        public List<ExpenseReadDto> Expenses { get; set; } = new List<ExpenseReadDto>();
    }
}
