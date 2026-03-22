using Shared.Enums;
namespace Shared.DTOs.Expenses
{
    public class ExpenseExportImportDto
    {
        public string Title { get; set; }

        public decimal Cost { get; set; }

        public string? Description { get; set; }

        public string CategoryName { get; set; }

        public string? SubcategoryName { get; set; }

        public DateTime ExpenseDate { get; set; }

        public PaymentType PaymentType { get; set; }

        public Currency Currency { get; set; }
    }
}
