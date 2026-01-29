using Shared.Enums;

namespace Shared.DTOs.ExpenseDTOs.QueryParams
{
    public class ExpenseFilterParams
    {
        public List<int>? CategoryIds { get; set; }

        public List<int>? SubcategoryIds { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public decimal? FromCost { get; set; }

        public decimal? ToCost { get; set; }
        
        public Currency? Currency { get; set; }

        public List<PaymentType>? PaymentTypes { get; set; }
    }
}
