using Data.Interfaces;
using Data.Models;
using Services.Interfaces;

namespace Services.Data
{
    public class DataService(IUserAccessor user, IExpenseRepository expenseRepository, ICategoryRepository categoryRepository, ISubcategoryRepository subcategoryRepository, IBudgetRepository budgetRepository, IGoalRepository goalRepository, IRecurringExpenseRepository recurringExpenseRepository, IGoalContributionRepository goalContributionRepository) : IDataService
    {
        public async Task<bool> DeleteAllData()
        {
            await expenseRepository.DeleteAllAsync(user.Id);
            await budgetRepository.DeleteAllAsync(user.Id);
            List<Goal> goals = await goalRepository.GetAllAsync(user.Id);
            foreach (var goal in goals)
            {
                await goalContributionRepository.DeleteAllAsync(goal.Id);
            }
            await goalRepository.DeleteAllAsync(user.Id);
            await recurringExpenseRepository.DeleteAllAsync(user.Id);
            await subcategoryRepository.DeleteAllAsync(user.Id);
            await categoryRepository.DeleteAllAsync(user.Id);
            return true;
        }
    }
}
