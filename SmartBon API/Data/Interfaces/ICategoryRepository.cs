using Data.Models;

namespace Data.Interfaces
{
    /// <summary>
    /// Repository for managing categories.
    /// </summary>
    public interface ICategoryRepository : IRepository<Category>
    {
        /// <summary>
        /// Retrieves all categories for a specific user.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <returns>A list of categories.</returns>
        Task<List<Category>> GetAllAsync(int userId);

        /// <summary>
        /// Deletes all categories associated with a specific user.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <returns>True if the operation was successful; otherwise, false.</returns>
        Task<bool> DeleteAllAsync(int userId);
    }
}