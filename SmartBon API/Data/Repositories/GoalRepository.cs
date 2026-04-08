using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;
using Shared.ApiExceptions;

namespace Data.Repositories
{
    /// <inheritdoc />
    public class GoalRepository(AppDbContext context) : EFRepository<Goal>(context), IGoalRepository
    {
        /// <inheritdoc />
        public async Task<bool> DeleteAllAsync(int userId)
        {
            int rowsAffected = await _dbSet
                .Where(e => e.UserId == userId)
                .ExecuteDeleteAsync();

            return rowsAffected >= 0;
        }

        /// <inheritdoc />
        public async Task<List<Goal>> GetAllAsync(int userId, bool? isActive = true)
        {
            IQueryable<Goal> query = _dbSet.AsQueryable().Include(g => g.Contributions);

            query = query.Where(f => f.UserId == userId);
            query = query.Where(f => f.IsActive == isActive);

            var goals = await query.ToListAsync();

            return goals;
        }

        /// <inheritdoc />
        public async override Task<Goal?> GetByIdAsync(int id)
        {
            var query = _dbSet.AsQueryable().Include(c => c.Contributions);

            return await query.SingleOrDefaultAsync(x => EF.Property<int>(x, "Id") == id);
        }

        /// <inheritdoc />
        public override async Task DeleteAsync(Goal goal)
        {
            var contributions = context.GoalContributions.Where(s => s.GoalId == goal.Id);
            context.GoalContributions.RemoveRange(contributions);
            context.Goals.Remove(goal);
            await context.SaveChangesAsync();
        }
    }
}
