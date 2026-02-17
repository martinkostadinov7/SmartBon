using Shared.Enums;
namespace Shared.DTOs.Expenses
{
    public class ExpenseCreateDto
    {
        public required string Title { get; set; }

        public string? Description { get; set; }

        public decimal Cost { get; set; }

        public int CategoryId { get; set; }

        public int? SubcategoryId { get; set; }

        public DateTime ExpenseDate { get; set; }

        public PaymentType PaymentType { get; set; }

        public Currency Currency { get; set; }

    }
}
