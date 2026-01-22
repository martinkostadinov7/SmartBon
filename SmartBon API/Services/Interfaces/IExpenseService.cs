using Shared.DTOs.ExpenseDTOs;
namespace Services.Interfaces
{
    public interface IExpenseService
    {
        Task<ExpenseReadDto> CreateExpenseAsync(ExpenseCreateDto dto);
        Task<ExpenseReadDto> GetExpenseByIdAsync(int id);
        Task<List<ExpenseReadDto>> GetExpensesAsync();
        Task<ExpenseReadDto> DeleteExpenseAsync(int id);
        Task<ExpenseReadDto> UpdateExpenseAsync(int id, ExpenseUpdateDto dto);
        Task<List<ExpenseReadDto>> GetRecentExpensesAsync(int count);

    }
}
