using Data.Models;
using System.Linq.Expressions;
namespace Data.Interfaces
{
    public interface IExpenseRepository : IRepository<Expense>
    {
        Task<List<Expense>> GetAllAsync(int userId);
        Task<List<Expense>> GetRecentExpensesAsync(int userId, int count);
    }
}
