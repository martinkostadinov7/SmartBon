using Shared.DTOs.Budgets;

namespace Services.Interfaces
{
    /// <summary>
    /// Service for managing financial budgets.
    /// </summary>
    public interface IBudgetService
    {
        /// <summary> Creates a new budget. </summary>
        Task<BudgetReadDto> CreateBudgetAsync(BudgetCreateDto budgetCreateDto);

        /// <summary> Retrieves all currently active budgets for the current user. </summary>
        Task<List<BudgetReadDto>> GetActiveBudgetsAsync();

        /// <summary> Retrieves all archived (past) budgets for the current user. </summary>
        Task<List<BudgetReadDto>> GetArchivedBudgetsAsync();

        /// <summary> Retrieves a specific budget by its ID. </summary>
        Task<BudgetReadDto> GetBudgetByIdAsync(int id);

        /// <summary> Deletes a specific budget permanently. </summary>
        Task<BudgetReadDto> DeleteBudgetAsync(int id);

        /// <summary> Updates an existing budget's details. </summary>
        Task<BudgetReadDto> UpdateBudgetAsync(int id, BudgetUpdateDto budgetUpdateDto);

        /// <summary> Marks a budget as archived (inactive). </summary>
        Task ArchiveBudgetAsync(int id);
    }
}