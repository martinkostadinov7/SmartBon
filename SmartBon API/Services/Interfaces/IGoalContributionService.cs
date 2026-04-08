using Shared.DTOs.Goals.Contributions;

namespace Services.Interfaces
{
    /// <summary>
    /// Service for managing individual financial deposits (contributions) towards goals.
    /// </summary>
    public interface IGoalContributionService
    {
        /// <summary> Adds a new contribution to a specific goal. </summary>
        Task<GoalContributionReadDto> CreateGoalContributionAsync(GoalContributionCreateDto goalCreateDto);

        /// <summary> Deletes a specific goal contribution. </summary>
        Task<GoalContributionReadDto> DeleteGoalContributionAsync(int id);

        /// <summary> Updates the details of an existing goal contribution. </summary>
        Task<GoalContributionReadDto> UpdateGoalContributionAsync(int id, GoalContributionUpdateDto goalUpdateDto);
    }
}