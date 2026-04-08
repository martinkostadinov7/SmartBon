using Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Data.Interfaces
{
    /// <summary>
    /// Repository for managing financial goals.
    /// </summary>
    public interface IGoalRepository : IRepository<Goal>
    {
        /// <summary>
        /// Retrieves all financial goals for a specific user.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <param name="isActive">Flag indicating whether to return only active goals.</param>
        /// <returns>A list of financial goals.</returns>
        public Task<List<Goal>> GetAllAsync(int userId, bool? isActive = true);

        /// <summary>
        /// Deletes all financial goals associated with a specific user.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <returns>True if the operation was successful; otherwise, false.</returns>
        Task<bool> DeleteAllAsync(int userId);
    }
}