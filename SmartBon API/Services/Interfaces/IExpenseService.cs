using Shared.DTOs.ExpenseDTOs;

namespace Services.Interfaces
{
    public interface IExpenseService
    {
        Task<ExpenseReadDto> CreateExpense(ExpenseCreateDto dto);
        Task<ExpenseReadDto> GetExpenseById(int id);
        Task<ExpenseReadDto> DeleteExpense(int id);
    }
}
