using System.Linq.Expressions;

namespace Data.Interfaces
{
    /// <summary>
    /// Base generic repository providing core CRUD operations.
    /// </summary>
    /// <typeparam name="T">The type of the entity managed by the repository.</typeparam>
    public interface IRepository<T>
    {
        /// <summary>
        /// Retrieves an entity by its primary key.
        /// </summary>
        /// <param name="id">The identifier of the entity.</param>
        /// <returns>The entity, or null if not found.</returns>
        Task<T?> GetByIdAsync(int id);

        /// <summary>
        /// Retrieves an entity by its primary key, eagerly loading specified navigation properties.
        /// </summary>
        /// <param name="id">The identifier of the entity.</param>
        /// <param name="includeProperties">An array of expressions representing the properties to include.</param>
        /// <returns>The entity, or null if not found.</returns>
        Task<T?> GetByIdAsync(int id, Expression<Func<T, object>>[] includeProperties);

        /// <summary>
        /// Retrieves all entities of type T from the database.
        /// </summary>
        /// <returns>A list of all entities.</returns>
        Task<List<T>> GetAllAsync();

        /// <summary>
        /// Adds a new entity to the database.
        /// </summary>
        /// <param name="entity">The entity to add.</param>
        /// <returns>The added entity.</returns>
        Task<T> AddAsync(T entity);

        /// <summary>
        /// Updates an existing entity in the database.
        /// </summary>
        /// <param name="entity">The entity to update.</param>
        /// <returns>The updated entity.</returns>
        Task<T> UpdateAsync(T entity);

        /// <summary>
        /// Deletes an entity from the database.
        /// </summary>
        /// <param name="entity">The entity to delete.</param>
        Task DeleteAsync(T entity);

        /// <summary>
        /// Finds entities matching a specified condition, with optional inclusion of navigation properties and sorting.
        /// </summary>
        /// <param name="where">The condition the entities must satisfy.</param>
        /// <param name="includeProperties">Navigation properties to eager load.</param>
        /// <param name="OrderByDescending">A function to order the results descending.</param>
        /// <returns>A list of matching entities.</returns>
        List<T> Find(Expression<Func<T, bool>> where, Expression<Func<T, object>>[] includeProperties = null, Func<IQueryable<T>, IOrderedQueryable<T>> OrderByDescending = null);
    }
}