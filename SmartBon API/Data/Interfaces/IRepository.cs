using System.Linq.Expressions;

namespace Data.Interfaces
{
    public interface IRepository<T> 
    {
        Task<T?> GetById(int id);

        Task<T?> GetById(int id, Expression<Func<T, object>>[] includeProperties);

        Task<List<T>> GetAll();
        
        Task<T> Add(T entity);
        
        Task<T> Update(T entity);
        
        Task Delete(T entity);
    }
}
