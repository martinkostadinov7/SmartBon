using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;
using Shared.ApiExceptions;

namespace Data.Repositories
{
    public class CategoryRepository(AppDbContext context) : EFRepository<Category>(context), ICategoryRepository
    {
        public override async Task DeleteAsync(Category category)
        {
            if (category.IsPredefined)
            {
                throw new BadRequestException("Cannot delete predefined categories!");
            }
            var subs = context.Subcategories.Where(s => s.CategoryId == category.Id);
            var expenses = context.Expenses.Where(e => subs.Any(s => s.Id == e.SubcategoryId));

            context.Expenses.RemoveRange(expenses);
            context.Subcategories.RemoveRange(subs);
            context.Categories.Remove(category);

            await context.SaveChangesAsync();
        }
        public async Task<List<Category>> GetAllAsync(int userId)
        {
            IQueryable<Category> query = _dbSet.AsQueryable();

            query = query
                .Include(c => c.Subcategories)
                .Where(f => f.UserId == userId || f.IsPredefined == true);

            var categories = await query.ToListAsync();

            return categories;
        }

        public async override Task<Category?> GetByIdAsync(int id)
        {
            var query = _dbSet.AsQueryable().Include(c => c.Subcategories);

            return await query.SingleOrDefaultAsync(x => EF.Property<int>(x, "Id") == id);
        }
    }
}
