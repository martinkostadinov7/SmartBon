using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Data.Repositories
{
    public class BudgetRepository(AppDbContext context) : EFRepository<Budget>(context), IBudgetRepository
    {
        public async Task<List<Budget>> GetAllAsync(int userId)
        {
            IQueryable<Budget> query = _dbSet.AsQueryable();

            query = query.Where(f => f.UserId == userId);

            var budgets = await query.ToListAsync();

            return budgets;
        }
    }
}
