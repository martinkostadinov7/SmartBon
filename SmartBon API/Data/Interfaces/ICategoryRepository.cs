using Data.Models;
namespace Data.Interfaces
{
    public interface ICategoryRepository : IRepository<Category>
    {
        Task<List<Category>> GetAllAsync(int userId);
        Task<bool> DeleteAllAsync(int userId);

    }
}
