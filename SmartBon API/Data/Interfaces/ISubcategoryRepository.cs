using Data.Models;

namespace Data.Interfaces
{
    /// <summary>
    /// Repository for managing subcategories.
    /// </summary>
    public interface ISubcategoryRepository : IRepository<Subcategory>
    {
        /// <summary>
        /// Retrieves all subcategories for a specific category belonging to a user.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <param name="categoryId">The identifier of the parent category.</param>
        /// <returns>A list of subcategories.</returns>
        public Task<List<Subcategory>> GetAllAsync(int userId, int categoryId);

        /// <summary>
        /// Deletes all subcategories associated with a specific user.
        /// </summary>
        /// <param name="userId">The identifier of the user.</param>
        /// <returns>True if the operation was successful; otherwise, false.</returns>
        Task<bool> DeleteAllAsync(int userId);
    }
}