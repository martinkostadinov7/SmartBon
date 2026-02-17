using Shared.Enums;

namespace Shared.DTOs.Expenses
{
    public class ExpenseFilledFromImageDto
    {
        public string? Description { get; set; } // list of products

        public decimal? Cost { get; set; } // accumulated price

        public DateTime? ExpenseDate { get; set; } // date on receipt

        public Currency? Currency { get; set; }
    }
}
