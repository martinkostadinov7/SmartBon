using Shared.DTOs.BudgetDTOs;

namespace Services.Interfaces
{
    public interface IBudgetService
    {
        Task<BudgetReadDto> CreateBudgetAsync(BudgetCreateDto budgetCreateDto);
        Task<List<BudgetReadDto>> GetBudgetsAsync();
        Task<BudgetReadDto> GetBudgetByIdAsync(int id);
        Task<BudgetReadDto> DeleteBudgetAsync(int id);
        Task<BudgetReadDto> UpdateBudgetAsync(int id, BudgetUpdateDto budgetUpdateDto);
    }
}
