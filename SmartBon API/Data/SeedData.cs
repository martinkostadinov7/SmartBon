using Data.Models;
using Shared.Enums;

namespace Data
{
    public static class SeedData
    {
        private static AppDbContext db;
        public static void SeedAll(AppDbContext dbContext)
        {
            db = dbContext;
            if (!db.Categories.Any())
            {
                SeedCategories();
            }
            if (!db.Subcategories.Any())
            {
                SeedSubcategories();
            }
            db.SaveChanges();
        }

        private static void SeedCategories()
        {
            List<Category> categories = new()
            {
                new Category("Food", IconType.Emoji, "🍔", true, null),
                new Category("Drinks", IconType.Emoji, "🍺", true, null),
                new Category("Groceries", IconType.Emoji, "🛒", true, null),
                new Category("Shopping", IconType.Emoji, "🛍", true, null),
                new Category("Transport", IconType.Emoji, "🚗", true, null),
                new Category("Bills", IconType.Emoji, "💵", true, null),
                new Category("Travel", IconType.Emoji, "🧳", true, null),
                new Category("Beauty", IconType.Emoji, "🌸", true, null),
                new Category("Gifts", IconType.Emoji, "🎁", true, null),
            };
            db.Categories.AddRange(categories);
        }

        private static void SeedSubcategories()
        {
            List<Subcategory> subcategories = new()
            {
                new Subcategory("Restaurants", IconType.Emoji, "🍽️", 1, 1),
                new Subcategory("Fast Food", IconType.Emoji, "🍔", 1, 1),
                new Subcategory("Alcohol", IconType.Emoji, "🍺", 2, 1),
                new Subcategory("Soft Drinks", IconType.Emoji, "🥤", 2, 1),
                new Subcategory("Coffee & Tea", IconType.Emoji, "☕", 2, 1),
                new Subcategory("Fuel", IconType.Emoji, "⛽", 5, 1),
                new Subcategory("Taxi", IconType.Emoji, "🚕", 5, 1),
                new Subcategory("Public Transport", IconType.Emoji, "🚌", 5, 1)
            };
            db.Subcategories.AddRange(subcategories);
        }
    }
}
    