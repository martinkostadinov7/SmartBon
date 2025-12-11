using Data.Models;
namespace Data.Interfaces
{
    public interface ICategoryRepository : IRepository<Category>
    {
        Task<List<Category>> GetAll(int userId);
    }
}
