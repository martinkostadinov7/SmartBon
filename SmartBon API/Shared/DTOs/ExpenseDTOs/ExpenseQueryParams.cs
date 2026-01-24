using Shared.DTOs.ExpenseDTOs.QueryParams;
namespace Shared.DTOs.ExpenseDTOs
{
    public class ExpenseQueryParams
    {
        public string? Search { get; set; }

        public ExpenseFilterParams? FilterParams { get; set; }

        public ExpenseSortParams? SortParams { get; set; }
    }
}
