using Shared.Enums;

namespace Shared.DTOs.ExpenseDTOs.QueryParams
{
    public class ExpenseSortParams
    {
        public bool Descending { get; set; }

        public SortBy Sortby { get; set; }
    }
}
