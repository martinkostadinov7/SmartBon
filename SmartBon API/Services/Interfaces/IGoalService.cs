using Data.Models;
using Data.Repositories;
using Shared.ApiExceptions;
using Shared.DTOs.Goals;

namespace Services.Interfaces
{
    public interface IGoalService
    {
        Task<GoalReadDto> CreateGoalAsync(GoalCreateDto goalCreateDto);
        Task<List<GoalReadDto>> GetActiveGoalsAsync();
        Task<List<GoalReadDto>> GetRealisedGoalsAsync();
        Task<GoalReadDto> GetGoalByIdAsync(int id);
        Task<GoalReadDto> DeleteGoalAsync(int id);
        Task<GoalReadDto> UpdateGoalAsync(int id, GoalUpdateDto goalUpdateDto);
        Task AddContributionAsync(int goalId, GoalContribution contribution);
        Task RemoveContributionAsync(int goalId, GoalContribution contribution);
        Task UpdateGoalBalanceAsync(int goalId, decimal oldAmount, decimal newAmount);
        Task RealiseGoalAsync(int goalId);
    }
}
