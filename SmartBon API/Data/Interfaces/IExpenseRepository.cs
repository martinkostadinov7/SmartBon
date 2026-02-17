using Data.Models;
using Shared.DTOs.Expenses;
using Shared.DTOs.Expenses.Ranges;
namespace Data.Interfaces
{
    public interface IExpenseRepository : IRepository<Expense>
    {
        Task<List<Expense>> GetAllAsync(int userId);
        Task<List<Expense>> GetRecentExpensesAsync(int userId, int count);
        Task<List<Expense>> GetExpensesFromQueryAsync(int userId, ExpenseQueryParams queryParams);
        Task<CostRangeDto> GetCostRangeAsync(int userId);
        Task<DateRangeDto> GetDateRangeAsync(int userId);
    }
}
