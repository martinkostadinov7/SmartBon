using Shared.Enums;namespace Shared.DTOs.ExpenseDTOs
{
    public class ExpenseUpdateDto
    {
        public string Title { get; set; }

        public string? Description { get; set; }

        public decimal Cost { get; set; }

        public DateTime CreatedAt { get; set; }

        public int CategoryId { get; set; }

        public int? SubcategoryId { get; set; }

        public DateTime ExpenseDate { get; set; }

        public PaymentType PaymentType { get; set; }
    }
}
