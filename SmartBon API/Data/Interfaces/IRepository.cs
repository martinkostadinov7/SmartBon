namespace Data.Interfaces
{
    public interface IRepository<T> 
    {
        Task<T?> GetById(int id);

        Task<IEnumerable<T>> GetAll();
        
        Task<T> Add(T entity);
        
        Task<T> Update(T entity);
        
        Task Delete(T entity);
    }
}
