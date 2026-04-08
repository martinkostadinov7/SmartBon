using AutoMapper;
using Data.Interfaces;
using Data.Models;
using Services.Interfaces;
using Shared.ApiExceptions;
using Shared.DTOs.Goals;

namespace Services.Goals
{
    /// <inheritdoc />
    public class GoalService(IGoalRepository goalRepository, IUserAccessor user, IMapper mapper) : IGoalService
    {
        /// <inheritdoc />
        public async Task AddContributionAsync(int goalId, GoalContribution contribution)
        {
            Goal goal = await goalRepository.GetByIdAsync(goalId) ?? throw new NotFoundException($"Goal with id {goalId} was not found!");
            goal.Contributions.Add(contribution);
            goal.CurrentAmount += contribution.Amount;

            await goalRepository.UpdateAsync(goal);
        
        }

        /// <inheritdoc />
        public async Task RemoveContributionAsync(int goalId, GoalContribution contribution)
        {
            Goal goal = await goalRepository.GetByIdAsync(goalId) ?? throw new NotFoundException($"Goal with id {goalId} was not found!");
            goal.Contributions.Remove(contribution);
            goal.CurrentAmount -= contribution.Amount;

            await goalRepository.UpdateAsync(goal);
        }

        /// <inheritdoc />
        public async Task UpdateGoalBalanceAsync(int goalId, decimal oldAmount, decimal newAmount)
        {
            var goal = await goalRepository.GetByIdAsync(goalId)
                       ?? throw new NotFoundException($"Goal with id {goalId} was not found!");

            goal.CurrentAmount = (goal.CurrentAmount - oldAmount) + newAmount;

            await goalRepository.UpdateAsync(goal);
        }

        /// <inheritdoc />
        public async Task<GoalReadDto> CreateGoalAsync(GoalCreateDto goalCreateDto)
        {
            Goal goal = mapper.Map<Goal>(goalCreateDto);
            goal.UserId = user.Id;
            goal.CurrentAmount = 0;
            goal.StartDate = DateTime.Now;
            await goalRepository.AddAsync(goal);
            return mapper.Map<GoalReadDto>(goal);
        }

        /// <inheritdoc />
        public async Task<GoalReadDto> DeleteGoalAsync(int id)
        {
            Goal goalToDelete = await goalRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Goal with id {id} was not found!");
            await goalRepository.DeleteAsync(goalToDelete);
            return mapper.Map<GoalReadDto>(goalToDelete);
        }

        /// <inheritdoc />
        public async Task<GoalReadDto> GetGoalByIdAsync(int id)
        {
            Goal goal = await goalRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Goal with id {id} was not found!");
            goal.Contributions = goal.Contributions.OrderByDescending(c => c.DateTime).ToList();
            return mapper.Map<GoalReadDto>(goal);
        }

        /// <inheritdoc />
        public async Task<List<GoalReadDto>> GetActiveGoalsAsync()
        {
            List<Goal> goalsFromDb = await goalRepository.GetAllAsync(user.Id);

            return mapper.Map<List<GoalReadDto>>(goalsFromDb);
        }

        /// <inheritdoc />
        public async Task<List<GoalReadDto>> GetRealisedGoalsAsync()
        {
            List<Goal> goalsFromDb = await goalRepository.GetAllAsync(user.Id, false);

            return mapper.Map<List<GoalReadDto>>(goalsFromDb);
        }

        /// <inheritdoc />
        public async Task<GoalReadDto> UpdateGoalAsync(int id, GoalUpdateDto goalUpdateDto)
        {
            Goal goalToUpdate = await goalRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Goal with id {id} was not found!");
            mapper.Map(goalUpdateDto, goalToUpdate);
            await goalRepository.UpdateAsync(goalToUpdate);
            return mapper.Map<GoalReadDto>(goalToUpdate);
        }

        /// <inheritdoc />
        public async Task RealiseGoalAsync(int id)
        {
            Goal goal = await goalRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Goal with id {id} was not found!");
            goal.IsActive = false;
            await goalRepository.UpdateAsync(goal);
        }
    }
}
