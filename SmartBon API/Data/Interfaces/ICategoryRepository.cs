using Data.Models;
namespace Data.Interfaces
{
    public interface ICategoryRepository : IRepository<Category>
    {
        Task<List<Category>> GetAllAsync(int userId);
    }
}
