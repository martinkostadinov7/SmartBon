using Data.Interfaces;
using Data.Models;

namespace Data.Repositories
{
    public class ExpenseRepository(AppDbContext context) : EFRepository<Expense>(context), IExpenseRepository
    {
        public async Task<List<Expense>> GetAllAsync(int userId)
        {
            IQueryable<Expense> query = _dbSet.AsQueryable();

            query = query
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.ExpenseDate);

            var expenses = query.ToList();

            return expenses;
        }
        public async Task<List<Expense>> GetRecentExpensesAsync(int userId, int count)
        {
            IQueryable<Expense> query = _dbSet.AsQueryable();

            query = query
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.ExpenseDate)
                .Take(count);

            var expenses = query.ToList();

            return expenses;

        }
    }
}
