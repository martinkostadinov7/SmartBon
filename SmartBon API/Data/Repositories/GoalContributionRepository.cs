using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Data.Repositories
{
    /// <inheritdoc />
    public class GoalContributionRepository(AppDbContext context) : EFRepository<GoalContribution>(context), IGoalContributionRepository
    {
        /// <inheritdoc />
        public async Task<bool> DeleteAllAsync(int goalId)
        {
            int rowsAffected = await _dbSet
                .Where(e => e.GoalId == goalId)
                .ExecuteDeleteAsync();

            return rowsAffected >= 0;
        }
    }
}
