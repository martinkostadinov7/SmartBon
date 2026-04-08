using Data.Models;

namespace Data.Interfaces
{
    /// <summary>
    /// Repository for managing recurring expenses.
    /// </summary>
    public interface IRecurringExpenseRepository : IRepository<RecurringExpense>
    {
        /// <summary>
        /// Retrieves all recurring expenses that are pending execution.
        /// </summary>
        /// <returns>A list of pending recurring expenses.</returns>
        Task<List<RecurringExpense>> GetAllPendingAsync();

        /// <summary>
        /// Retrieves all recurring expenses for a specific user.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <returns>A list of recurring expenses.</returns>
        Task<List<RecurringExpense>> GetAllAsync(int userId);

        /// <summary>
        /// Deletes all recurring expenses associated with a specific user.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <returns>True if the operation was successful; otherwise, false.</returns>
        Task<bool> DeleteAllAsync(int userId);

        /// <summary>
        /// Retrieves a specific recurring expense by its identifier.
        /// </summary>
        /// <param name="id">The identifier of the recurring expense.</param>
        /// <returns>The recurring expense, or null if not found.</returns>
        Task<RecurringExpense?> GetRecurringExpenseByIdAsync(int id);
    }
}