using Shared.Enums;

namespace Shared.DTOs.ExpenseDTOs
{
    public class ExpenseReadDto
    {
        public int Id { get; set; }

        public required string Title { get; set; }

        public string? Description { get; set; }

        public decimal Cost { get; set; }

        public DateTime ExpenseDate { get; set; }

        public PaymentType PaymentType { get; set; }
    }
}
