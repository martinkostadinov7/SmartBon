using Data.Models;

namespace Data.Interfaces
{
    /// <summary>
    /// Repository for managing budgets.
    /// </summary>
    public interface IBudgetRepository : IRepository<Budget>
    {
        /// <summary>
        /// Retrieves all budgets for a specific user.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <param name="active">Flag indicating whether to return only active budgets.</param>
        /// <returns>A list of budgets.</returns>
        public Task<List<Budget>> GetAllAsync(int userId, bool? active = true);

        /// <summary>
        /// Deletes all budgets associated with a specific user.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <returns>True if the operation was successful; otherwise, false.</returns>
        Task<bool> DeleteAllAsync(int userId);
    }
}