using Data.Interfaces;
using Data.Models;

namespace Data.Repositories
{
    public class GoalContributionRepository(AppDbContext context) : EFRepository<GoalContribution>(context), IGoalContributionRepository
    {
    }
}
