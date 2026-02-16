using AutoMapper;
using Data.Interfaces;
using Data.Models;
using Data.Repositories;
using Services.Interfaces;
using Shared.ApiExceptions;
using Shared.DTOs.BudgetDTOs;
using Shared.DTOs.ExpenseDTOs;
using Shared.DTOs.ExpenseDTOs.QueryParams;

namespace Services.Budgets
{
    public class BudgetService(IBudgetRepository budgetRepository, IMapper mapper, IUserAccessor user, IExpenseRepository expenseRepository, ICategoryRepository categoryRepository) : IBudgetService
    {
        public async Task<BudgetReadDto> CreateBudgetAsync(BudgetCreateDto budgetCreateDto)
        {
            Budget budget = mapper.Map<Budget>(budgetCreateDto);
            budget.UserId = user.Id;
            ExpenseQueryParams queryParams = new ExpenseQueryParams
            {

                FilterParams = new ExpenseFilterParams
                {
                    CategoryIds = budget.CategoryIds,
                    SubcategoryIds = budget.SubcategoryIds,
                    StartDate = budget.From,
                    EndDate = budget.To,
                },
                SortParams = new ExpenseSortParams
                {

                }
                
            };
            if (budget.CategoryIds.Count == 1)
            {
                Category category = await categoryRepository.GetByIdAsync(budget.CategoryIds[0]);
                if (budget.SubcategoryIds.Count == category.Subcategories.Count)
                {
                    queryParams.FilterParams.SubcategoryIds = [];
                }
            }
            List<Expense> expenses = await expenseRepository.GetExpensesFromQueryAsync(user.Id, queryParams);
            foreach (var expense in expenses)
            {
                budget.CurrentAmount += expense.Cost;
            }
            if (budget.CurrentAmount > budget.Limit)
            {
                throw new BadRequestException("Current filters exceed the limit on the budget!");
            }
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
            List<Budget> budgetsFromDb = await budgetRepository.GetAllAsync(user.Id);

            return mapper.Map<List<BudgetReadDto>>(budgetsFromDb);
        }

        public async Task<BudgetReadDto> UpdateBudgetAsync(int id, BudgetUpdateDto dto)
        {
            Budget budgetToUpdate = await budgetRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Budget with id {id} was not found!");

            mapper.Map(dto, budgetToUpdate);
            budgetToUpdate.CurrentAmount = 0;

            ExpenseQueryParams queryParams = new ExpenseQueryParams
            {

                FilterParams = new ExpenseFilterParams
                {
                    CategoryIds = budgetToUpdate.CategoryIds,
                    SubcategoryIds = budgetToUpdate.SubcategoryIds,
                    StartDate = budgetToUpdate.From,
                    EndDate = budgetToUpdate.To,
                },
                SortParams = new ExpenseSortParams
                {

                }

            };
            if (budgetToUpdate.CategoryIds.Count == 1)
            {
                Category category = await categoryRepository.GetByIdAsync(budgetToUpdate.CategoryIds[0]);
                if (budgetToUpdate.SubcategoryIds.Count == category.Subcategories.Count)
                {
                    queryParams.FilterParams.SubcategoryIds = [];
                }
            }
            List<Expense> expenses = await expenseRepository.GetExpensesFromQueryAsync(user.Id, queryParams);
            foreach (var expense in expenses)
            {
                budgetToUpdate.CurrentAmount += expense.Cost;
            }
            if (budgetToUpdate.CurrentAmount > budgetToUpdate.Limit)
            {
                throw new BadRequestException("Current filters exceed the limit on the budget!");
            }
            await budgetRepository.UpdateAsync(budgetToUpdate);
            
            return mapper.Map<BudgetReadDto>(budgetToUpdate);
        }
    }
}
