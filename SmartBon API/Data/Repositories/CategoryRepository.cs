using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Data.Repositories
{
    public class CategoryRepository(AppDbContext context) : EFRepository<Category>(context), ICategoryRepository
    {
        public override async Task Delete(Category category)
        {
            if (category.IsPredefined)
            {
                throw new Exception("Cannot delete predefined categories!");
            }
            var subs = context.Subcategories.Where(s => s.CategoryId == category.Id);
            var expenses = context.Expenses.Where(e => subs.Any(s => s.Id == e.SubcategoryId));

            context.Expenses.RemoveRange(expenses);
            context.Subcategories.RemoveRange(subs);
            context.Categories.Remove(category);

            await context.SaveChangesAsync();
        }
        public async Task<List<Category>> GetAll(int userId)
        {
            IQueryable<Category> query = _dbSet.AsQueryable();

            query = query
                .Include(c => c.Subcategories)
                .Where(f => f.UserId == userId || f.IsPredefined == true);

            if (!await query.AnyAsync())
                throw new Exception("No categories were found for the provided category.");

            var categories = query.ToList();

            return categories;
        }
    }
}
