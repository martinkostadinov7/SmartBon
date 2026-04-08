using Data.Models;
using Shared.DTOs.Goals;

namespace Services.Interfaces
{
    /// <summary>
    /// Service for managing financial saving goals.
    /// </summary>
    public interface IGoalService
    {
        /// <summary> Creates a new financial goal. </summary>
        Task<GoalReadDto> CreateGoalAsync(GoalCreateDto goalCreateDto);

        /// <summary> Retrieves all ongoing (active) goals for the current user. </summary>
        Task<List<GoalReadDto>> GetActiveGoalsAsync();

        /// <summary> Retrieves all completed (realised) goals for the current user. </summary>
        Task<List<GoalReadDto>> GetRealisedGoalsAsync();

        /// <summary> Retrieves a specific goal by its ID. </summary>
        Task<GoalReadDto> GetGoalByIdAsync(int id);

        /// <summary> Deletes a specific goal and its contributions. </summary>
        Task<GoalReadDto> DeleteGoalAsync(int id);

        /// <summary> Updates an existing goal's details. </summary>
        Task<GoalReadDto> UpdateGoalAsync(int id, GoalUpdateDto goalUpdateDto);

        /// <summary> Internally links a new contribution to a goal and updates the goal's current amount. </summary>
        Task AddContributionAsync(int goalId, GoalContribution contribution);

        /// <summary> Internally unlinks a contribution from a goal and recalculates the goal's current amount. </summary>
        Task RemoveContributionAsync(int goalId, GoalContribution contribution);

        /// <summary> Adjusts the goal's total balance when a contribution is modified. </summary>
        Task UpdateGoalBalanceAsync(int goalId, decimal oldAmount, decimal newAmount);

        /// <summary> Marks a goal as successfully completed (realised). </summary>
        Task RealiseGoalAsync(int goalId);
    }
}