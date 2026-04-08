using Data.Models;
using Shared.DTOs.Expenses;
using Shared.DTOs.Expenses.Ranges;

namespace Data.Interfaces
{
    /// <summary>
    /// Repository for managing expenses.
    /// </summary>
    public interface IExpenseRepository : IRepository<Expense>
    {
        /// <summary>
        /// Retrieves all expenses for a specific user.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <returns>A list of expenses.</returns>
        Task<List<Expense>> GetAllAsync(int userId);

        /// <summary>
        /// Retrieves the most recent expenses for a specific user.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <param name="count">The number of expenses to retrieve.</param>
        /// <returns>A list of the recent expenses.</returns>
        Task<List<Expense>> GetRecentExpensesAsync(int userId, int count);

        /// <summary>
        /// Retrieves expenses based on specified query and filter parameters.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <param name="queryParams">The parameters for filtering and searching.</param>
        /// <returns>A list of filtered expenses.</returns>
        Task<List<Expense>> GetExpensesFromQueryAsync(int userId, ExpenseQueryParams queryParams);

        /// <summary>
        /// Retrieves the cost range (minimum and maximum amounts) of a user's expenses.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <returns>A DTO containing the lowest and highest expense amounts.</returns>
        Task<CostRangeDto> GetCostRangeAsync(int userId);

        /// <summary>
        /// Retrieves the date range (earliest and latest dates) of a user's expenses.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <returns>A DTO containing the start and end dates.</returns>
        Task<DateRangeDto> GetDateRangeAsync(int userId);

        /// <summary>
        /// Adds a collection of expenses to the database in a single operation.
        /// </summary>
        /// <param name="expenses">The list of expenses to add.</param>
        Task AddRangeAsync(List<Expense> expenses);

        /// <summary>
        /// Deletes all expenses associated with a specific user.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <returns>True if the operation was successful; otherwise, false.</returns>
        Task<bool> DeleteAllAsync(int userId);
    }
}