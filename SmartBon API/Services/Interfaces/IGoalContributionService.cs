using Shared.DTOs.Goals.Contributions;

namespace Services.Interfaces
{
    public interface IGoalContributionService
    {
        Task<GoalContributionReadDto> CreateGoalContributionAsync(GoalContributionCreateDto goalCreateDto);
        Task<GoalContributionReadDto> DeleteGoalContributionAsync(int id);
        Task<GoalContributionReadDto> UpdateGoalContributionAsync(int id, GoalContributionUpdateDto goalUpdateDto);
    }
}
