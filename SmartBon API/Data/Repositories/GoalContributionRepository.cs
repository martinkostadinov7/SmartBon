using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Data.Repositories
{
    public class GoalContributionRepository(AppDbContext context) : EFRepository<GoalContribution>(context), IGoalContributionRepository
    {
        public async Task<bool> DeleteAllAsync(int goalId)
        {
            int rowsAffected = await _dbSet
                .Where(e => e.GoalId == goalId)
                .ExecuteDeleteAsync();

            return rowsAffected >= 0;
        }
    }
}
