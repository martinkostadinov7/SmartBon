using Shared.DTOs.ExpenseDTOs.QueryParams;
namespace Shared.DTOs.ExpenseDTOs
{
    public class ExpenseQueryParams
    {
        public string? Search { get; set; }

        public string? AfterValue { get; set; }

        public DateTime? AfterDate { get; set; }

        public int PageSize { get; set; } = 10;

        public ExpenseFilterParams? FilterParams { get; set; }

        public ExpenseSortParams SortParams { get; set; }
    }
}
