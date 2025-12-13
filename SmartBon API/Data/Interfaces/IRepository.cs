using System.Linq.Expressions;

namespace Data.Interfaces
{
    public interface IRepository<T> 
    {
        Task<T?> GetByIdAsync(int id);

        Task<T?> GetByIdAsync(int id, Expression<Func<T, object>>[] includeProperties);

        Task<List<T>> GetAllAsync();
        
        Task<T> AddAsync(T entity);
        
        Task<T> UpdateAsync(T entity);
        
        Task DeleteAsync(T entity);

        List<T> Find(Expression<Func<T, bool>> where, Expression<Func<T, object>>[] includeProperties = null, Func<IQueryable<T>, IOrderedQueryable<T>> OrderByDescending = null);
    }
}
