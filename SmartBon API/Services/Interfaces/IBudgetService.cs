using Shared.DTOs.Budgets;

namespace Services.Interfaces
{
    public interface IBudgetService
    {
        Task<BudgetReadDto> CreateBudgetAsync(BudgetCreateDto budgetCreateDto);
        Task<List<BudgetReadDto>> GetActiveBudgetsAsync();
        Task<List<BudgetReadDto>> GetArchivedBudgetsAsync();
        Task<BudgetReadDto> GetBudgetByIdAsync(int id);
        Task<BudgetReadDto> DeleteBudgetAsync(int id);
        Task<BudgetReadDto> UpdateBudgetAsync(int id, BudgetUpdateDto budgetUpdateDto);
        Task ArchiveBudgetAsync(int id);
    }
}
