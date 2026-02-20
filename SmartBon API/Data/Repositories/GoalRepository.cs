using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;
using Shared.ApiExceptions;

namespace Data.Repositories
{
    public class GoalRepository(AppDbContext context) : EFRepository<Goal>(context), IGoalRepository
    {
        public async Task<List<Goal>> GetAllAsync(int userId, bool? isActive = true)
        {
            IQueryable<Goal> query = _dbSet.AsQueryable().Include(g => g.Contributions);

            query = query.Where(f => f.UserId == userId);
            query = query.Where(f => f.IsActive == isActive);

            var goals = await query.ToListAsync();

            return goals;
        }
        public async override Task<Goal?> GetByIdAsync(int id)
        {
            var query = _dbSet.AsQueryable().Include(c => c.Contributions);

            return await query.SingleOrDefaultAsync(x => EF.Property<int>(x, "Id") == id);
        }

        public override async Task DeleteAsync(Goal goal)
        {
            var contributions = context.GoalContributions.Where(s => s.GoalId == goal.Id);
            context.GoalContributions.RemoveRange(contributions);
            context.Goals.Remove(goal);
            await context.SaveChangesAsync();
        }
    }
}
