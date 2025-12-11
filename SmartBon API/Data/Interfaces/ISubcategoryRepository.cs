using Data.Models;
namespace Data.Interfaces
{
    public interface ISubcategoryRepository : IRepository<Subcategory>
    {
        Task<List<Subcategory>> GetAll(int userId, int categoryId);
    }
}
