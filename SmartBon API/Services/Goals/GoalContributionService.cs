using AutoMapper;
using Data.Interfaces;
using Data.Models;
using Services.Interfaces;
using Shared.ApiExceptions;
using Shared.DTOs.Goals.Contributions;

namespace Services.Goals
{
    public class GoalContributionService(IGoalContributionRepository goalContributionRepository, IMapper mapper, IGoalService goalService) : IGoalContributionService
    {
        public async Task<GoalContributionReadDto> CreateGoalContributionAsync(GoalContributionCreateDto goalContributionCreateDto)
        {
            GoalContribution goalContribution = mapper.Map<GoalContribution>(goalContributionCreateDto);
            goalContribution.DateTime = DateTime.Now;
            await goalContributionRepository.AddAsync(goalContribution);
            await goalService.AddContributionAsync(goalContribution.GoalId, goalContribution);
            return mapper.Map<GoalContributionReadDto>(goalContribution);
        }

        public async Task<GoalContributionReadDto> DeleteGoalContributionAsync(int id)
        {
            GoalContribution goalContributionToDelete = await goalContributionRepository.GetByIdAsync(id) ?? throw new NotFoundException($"GoalContribution with id {id} was not found!");
            await goalContributionRepository.DeleteAsync(goalContributionToDelete);
            await goalService.RemoveContributionAsync(goalContributionToDelete.GoalId, goalContributionToDelete);
            return mapper.Map<GoalContributionReadDto>(goalContributionToDelete);
        }

        public async Task<GoalContributionReadDto> UpdateGoalContributionAsync(int id, GoalContributionUpdateDto dto)
        {
            var contribution = await goalContributionRepository.GetByIdAsync(id)
                               ?? throw new NotFoundException($"Contribution {id} not found!");

            decimal oldAmount = contribution.Amount;

            mapper.Map(dto, contribution);

            await goalContributionRepository.UpdateAsync(contribution);

            await goalService.UpdateGoalBalanceAsync(contribution.GoalId, oldAmount, contribution.Amount);

            return mapper.Map<GoalContributionReadDto>(contribution);
        }
    }
}
