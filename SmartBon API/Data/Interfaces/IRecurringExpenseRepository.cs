using Data.Models;

namespace Data.Interfaces
{
    public interface IRecurringExpenseRepository : IRepository<RecurringExpense>
    {
        Task<List<RecurringExpense>> GetAllPendingAsync();
        Task<List<RecurringExpense>> GetAllAsync(int userId);
        Task<bool> DeleteAllAsync(int userId);

    }
}
