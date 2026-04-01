using Microsoft.AspNetCore.Http;
using Shared.DTOs;
using Shared.DTOs.Expenses;
using Shared.DTOs.Expenses.Ranges;
using Shared.DTOs.Expenses.Recurring;
namespace Services.Interfaces
{
    public interface IExpenseService
    {
        Task<ExpenseReadDto> CreateExpenseAsync(ExpenseCreateDto dto);
        Task<RecurringExpenseReadDto> CreateRecurringExpenseAsync(RecurringExpenseCreateDto dto);
        Task<RecurringExpenseReadDto> UpdateRecurringExpenseAsync(int id, RecurringExpenseUpdateDto dto);
        Task<List<RecurringExpenseReadDto>> GetAllRecurringExpenses();
        Task<ExpenseReadDto> GetExpenseByIdAsync(int id);
        Task<List<ExpenseReadDto>> GetExpensesAsync();
        Task<List<ExpenseReadDto>> GetExpensesWithQueryParamsAsync(ExpenseQueryParams queryParams);
        Task<ExpenseReadDto> DeleteExpenseAsync(int id);
        Task<ExpenseReadDto> UpdateExpenseAsync(int id, ExpenseUpdateDto dto);
        Task<List<ExpenseReadDto>> GetRecentExpensesAsync(int count);
        Task<CostRangeDto> GetCostRangeAsync();
        Task<DateRangeDto> GetDateRangeAsync();
        Task<ExpenseFilledFromImageDto> ExtractExpenseDataAsync(IFormFile image);
        Task<ExportFileResultDto> ExportExpensesAsync(ExpenseQueryParams queryParams);
        Task<bool> ImportExpensesAsync(IFormFile csvFile);
        Task<RecurringExpenseReadDto> GetRecurringExpenseById(int id);
        Task<RecurringExpenseReadDto> DeleteRecurringExpenseAsync(int id);
    }
}
