using Data.Models;

namespace Data.Interfaces
{
    /// <summary>
    /// Repository for managing goal contributions.
    /// </summary>
    public interface IGoalContributionRepository : IRepository<GoalContribution>
    {
        /// <summary>
        /// Deletes all goal contributions associated with a specific user.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <returns>True if the operation was successful; otherwise, false.</returns>
        Task<bool> DeleteAllAsync(int userId);
    }
}