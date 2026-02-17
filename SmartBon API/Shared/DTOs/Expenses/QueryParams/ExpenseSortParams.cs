using Shared.Enums;

namespace Shared.DTOs.Expenses.QueryParams
{
    public class ExpenseSortParams
    {
        public bool Descending { get; set; } = true;

        public SortBy Sortby { get; set; } = SortBy.Date;
    }
}
