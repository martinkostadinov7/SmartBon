using Data.Models;

namespace Data.Interfaces
{
    public interface IGoalContributionRepository : IRepository<GoalContribution>
    {
        Task<bool> DeleteAllAsync(int userId);

    }
}
