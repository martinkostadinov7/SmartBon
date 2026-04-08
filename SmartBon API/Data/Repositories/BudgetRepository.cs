using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Data.Repositories
{
    /// <inheritdoc />
    public class BudgetRepository(AppDbContext context) : EFRepository<Budget>(context), IBudgetRepository
    {
        /// <inheritdoc />
        public async Task<List<Budget>> GetAllAsync(int userId, bool? active = true)
        {
            IQueryable<Budget> query = _dbSet.AsQueryable();

            query = query.Where(f => f.UserId == userId);

            query = query.Where(f => f.IsActive == active);
            
            var budgets = await query.ToListAsync();

            return budgets;
        }

        /// <inheritdoc />
        public async Task<bool> DeleteAllAsync(int userId)
        {
            int rowsAffected = await _dbSet
                .Where(e => e.UserId == userId)
                .ExecuteDeleteAsync();

            return rowsAffected >= 0;
        }
    }
}
