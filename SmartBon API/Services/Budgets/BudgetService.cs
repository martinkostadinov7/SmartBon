using AutoMapper;
using Data.Interfaces;
using Data.Models;
using Services.Interfaces;
using Shared.ApiExceptions;
using Shared.DTOs.BudgetDTOs;

namespace Services.Budgets
{
    public class BudgetService(IBudgetRepository budgetRepository, IMapper mapper, IUserAccessor user) : IBudgetService
    {
        public async Task<BudgetReadDto> CreateBudgetAsync(BudgetCreateDto budgetCreateDto)
        {
            Budget budget = mapper.Map<Budget>(budgetCreateDto);
            budget.UserId = user.Id;
            await budgetRepository.AddAsync(budget);
            return mapper.Map<BudgetReadDto>(budget);
        }

        public async Task<BudgetReadDto> DeleteBudgetAsync(int id)
        {
            Budget budgetToDelete = await budgetRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Budget with id {id} was not found!");
            await budgetRepository.DeleteAsync(budgetToDelete); 
            return mapper.Map<BudgetReadDto>(budgetToDelete);
        }

        public async Task<BudgetReadDto> GetBudgetByIdAsync(int id)
        {
            Budget budget = await budgetRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Budget with id {id} was not found!");
            return mapper.Map<BudgetReadDto>(budget);
        }

        public async Task<List<BudgetReadDto>> GetBudgetsAsync()
        {
            List<Budget> budgetsFromDb = await budgetRepository.GetAll(user.Id);

            return mapper.Map<List<BudgetReadDto>>(budgetsFromDb);
        }

        public async Task<BudgetReadDto> UpdateBudgetAsync(int id, BudgetUpdateDto dto)
        {
            Budget budgetToUpdate = await budgetRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Budget with id {id} was not found!");

            mapper.Map(dto, budgetToUpdate);

            await budgetRepository.UpdateAsync(budgetToUpdate);
            
            return mapper.Map<BudgetReadDto>(budgetToUpdate);
        }
    }
}
