using Data.Models;
namespace Data.Interfaces
{
    public interface ISubcategoryRepository : IRepository<Subcategory>
    {
        public Task<List<Subcategory>> GetAll(int userId, int categoryId);
    }
}
