using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Data.Repositories
{
    public class BudgetRepository(AppDbContext context) : EFRepository<Budget>(context), IBudgetRepository
    {
        public async Task<List<Budget>> GetAllAsync(int userId, bool? active = true)
        {
            IQueryable<Budget> query = _dbSet.AsQueryable();

            query = query.Where(f => f.UserId == userId);

            query = query.Where(f => f.IsActive == active);
            
            var budgets = await query.ToListAsync();

            return budgets;
        }
    }
}
