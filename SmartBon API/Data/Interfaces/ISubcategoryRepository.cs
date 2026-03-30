using Data.Models;
namespace Data.Interfaces
{
    public interface ISubcategoryRepository : IRepository<Subcategory>
    {
        public Task<List<Subcategory>> GetAllAsync(int userId, int categoryId);
        Task<bool> DeleteAllAsync(int userId);

    }
}
