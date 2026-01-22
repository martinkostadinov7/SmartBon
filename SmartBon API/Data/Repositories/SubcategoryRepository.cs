using Data.Interfaces;
using Data.Models;

namespace Data.Repositories
{
    public class SubcategoryRepository(AppDbContext context) : EFRepository<Subcategory>(context), ISubcategoryRepository
    {
        public override async Task DeleteAsync(Subcategory subcategory)
        {
            var expenses = context.Expenses.Where(e => e.SubcategoryId == subcategory.Id);
            context.Expenses.RemoveRange(expenses);

            context.Subcategories.Remove(subcategory);

            await context.SaveChangesAsync();
        }

        public async Task<List<Subcategory>> GetAll(int userId, int categoryId)
        {
            IQueryable<Subcategory> query = _dbSet.AsQueryable();

            query = query.Where(f => f.CategoryId == categoryId && f.UserId == userId);

            var subcategories = query.ToList();

            return subcategories;
        }
    }
}
