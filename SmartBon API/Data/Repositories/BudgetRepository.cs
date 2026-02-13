using Data.Interfaces;
using Data.Models;

namespace Data.Repositories
{
    public class BudgetRepository(AppDbContext context) : EFRepository<Budget>(context), IBudgetRepository
    {
        public async Task<List<Budget>> GetAll(int userId)
        {
            IQueryable<Budget> query = _dbSet.AsQueryable();

            query = query.Where(f => f.UserId == userId);

            var budgets = query.ToList();

            return budgets;
        }
    }
}
