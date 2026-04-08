using Data.Models;
using Microsoft.AspNetCore.Identity;
using Shared.Enums;

namespace Data
{
    /// <summary>
    /// Provides utility methods to populate the database with initial and test data.
    /// </summary>
    public static class SeedData
    {
        private static AppDbContext db;

        /// <summary> A predefined palette of soft colors used for UI elements. </summary>
        public static readonly string[] Colors =
        {
            "#EF9A9A", "#FFAB91", "#FFCC80", "#FFE082", "#FFF59D",
            "#E6EE9C", "#C5E1A5", "#A5D6A7", "#80CBC4", "#80DEEA",
            "#81D4FA", "#90CAF9", "#9FA8DA", "#B39DDB", "#CE93D8",
            "#F48FB1", "#BCAAA4", "#B0BEC5", "#E0E0E0"
        };

        /// <summary>
        /// Executes all seeding operations if the respective database tables are currently empty.
        /// </summary>
        /// <param name="dbContext">The application database context.</param>
        public static void SeedAll(AppDbContext dbContext)
        {
            db = dbContext;

            if (!db.Users.Any()) SeedUsers();
            if (!db.Categories.Any()) SeedCategories();
            if (!db.Subcategories.Any()) SeedSubcategories();
            if (!db.Expenses.Any()) SeedExpenses();
            if (!db.Budgets.Any()) SeedBudgets(); // Fixed the condition logic here from your original code (was checking db.Expenses.Any() twice)
        }

        private static void SeedBudgets()
        {
            List<Budget> budgets = new List<Budget>
            {
                new Budget("Monthly Transport", "Fuel, Public Transport and Car Maintenance", 1, new DateTime(2026, 1, 1, 14, 0, 0), new DateTime(2026, 2, 1, 3, 8, 0), BudgetDateRange.Monthly, 2000.00m, 1600.22m, "🚗", "#81D4FA", new List<int> { 5, 7 }, new List<int>()),
                new Budget("Dining Out & Fast Food", "Monthly limit for restaurants and fast food", 1, new DateTime(2026, 2, 1, 0, 0, 0), new DateTime(2026, 2, 7, 23, 59, 59), BudgetDateRange.Weekly, 200.00m, 67.67m, "🍔", "#EF9A9A", new List<int> { 1 }, new List<int> { 1, 2 })
            };
            db.Budgets.AddRange(budgets);
            db.SaveChanges();
        }

        private static void SeedUsers()
        {
            var hasher = new PasswordHasher<User>();
            List<User> users = new()
            {
                new User("m.kostadinov07@gmail.com", hasher.HashPassword(null!, "192837465Aqs"), "Martin Kostadinov", true, Currency.EUR, true, "bg"),
                new User("temp@example.com", hasher.HashPassword(null!, "123456789"), "Temp User", false, Currency.USD, true, "en")
            };
            db.Users.AddRange(users);
            db.SaveChanges();
        }

        private static void SeedCategories()
        {
            var colorPicker = new ColorPicker(Colors);
            List<Category> categories = new()
            {
                new Category("Food", "🍔", colorPicker.GetNext(), true, null),
                new Category("Drinks", "🍺", colorPicker.GetNext(), true, null),
                new Category("Groceries", "🛒", colorPicker.GetNext(), true, null),
                new Category("Shopping", "🛍", colorPicker.GetNext(), true, null),
                new Category("Transport", "🚗", colorPicker.GetNext(), true, null),
                new Category("Bills", "💵", colorPicker.GetNext(), true, null),
                new Category("Travel", "🧳", colorPicker.GetNext(), true, null),
                new Category("Beauty", "🌸", colorPicker.GetNext(), true, null),
                new Category("Gifts", "🎁", colorPicker.GetNext(), true, null),
            };

            db.Categories.AddRange(categories);
            db.SaveChanges();
        }

        private static void SeedSubcategories()
        {
            var colorPicker = new ColorPicker(Colors);
            List<Subcategory> subcategories = new()
            {
                new Subcategory("Restaurants", "🍽️", colorPicker.GetNext(), 1, 1),
                new Subcategory("Fast Food", "🍔", colorPicker.GetNext(), 1, 1),
                new Subcategory("Alcohol", "🍺", colorPicker.GetNext(), 1, 2),
                new Subcategory("Soft Drinks", "🥤", colorPicker.GetNext(), 1, 2),
                new Subcategory("Coffee & Tea", "☕", colorPicker.GetNext(), 1, 2),
                new Subcategory("Fuel", "⛽", colorPicker.GetNext(), 1, 5),
                new Subcategory("Taxi", "🚕", colorPicker.GetNext(), 1, 5),
                new Subcategory("Public Transport","🚌", colorPicker.GetNext(), 1, 5),
            };

            db.Subcategories.AddRange(subcategories);
            db.SaveChanges();
        }

        private static void SeedExpenses()
        {
            Dictionary<int, List<int?>> CategorySubcategories = new()
            {
                { 1, new List<int?> { 1, 2 } },          // Food
                { 2, new List<int?> { 3, 4, 5 } },       // Drinks
                { 3, new List<int?> { null } },          // Groceries
                { 4, new List<int?> { null } },          // Shopping
                { 5, new List<int?> { 6, 7, 8 } },       // Transport
                { 6, new List<int?> { null } },          // Bills
                { 7, new List<int?> { null } },          // Travel
                { 8, new List<int?> { null } },          // Beauty
                { 9, new List<int?> { null } }           // Gifts
            };

            Dictionary<int, string[]> CategoryTitles = new()
            {
                { 1, new[] { "Lunch", "Dinner", "Breakfast", "Brunch", "Takeaway food", "Pizza order", "Burger combo", "Sushi order", "Snack" } },
                { 2, new[] { "Coffee", "Morning coffee", "Iced coffee", "Tea", "Soft drink", "Beer", "Wine", "Cocktail", "Drinks with friends" } },
                { 3, new[] { "Weekly groceries", "Supermarket shopping", "Organic food", "Market groceries" } },
                { 4, new[] { "Online shopping", "Clothes shopping", "Shoes purchase", "Electronics", "Accessories" } },
                { 5, new[] { "Taxi ride", "Gas refill", "Fuel", "Parking fee", "Public transport", "Bus ticket", "Metro ticket" } },
                { 6, new[] { "Electricity bill", "Water bill", "Internet bill", "Phone bill", "Subscription payment" } },
                { 7, new[] { "Hotel booking", "Flight ticket", "Train ticket", "Car rental", "Travel expenses" } },
                { 8, new[] { "Haircut", "Barber visit", "Hair styling", "Cosmetics", "Skincare products" } },
                { 9, new[] { "Birthday gift", "Anniversary gift", "Holiday gift", "Surprise gift" } }
            };

            Dictionary<int, string[]> CategoryDescriptions = new()
            {
                { 1, new[] { "Quick meal", "With friends", "Takeaway", null } },
                { 2, new[] { "After work", "With friends", "Evening drinks", null } },
                { 3, new[] { "Weekly shopping", "Supermarket", null } },
                { 4, new[] { "Online order", "In-store purchase", null } },
                { 5, new[] { "Daily commute", "Work related", null } },
                { 6, new[] { "Monthly payment", "Recurring expense", null } },
                { 7, new[] { "Vacation expense", "Business trip", null } },
                { 8, new[] { "Self care", "Appointment", null } },
                { 9, new[] { "For a friend", "Special occasion", null } }
            };

            var expenses = GenerateRandomExpenses(300, 1, DateTime.Now.AddMonths(-6), DateTime.Now);

            db.Expenses.AddRange(expenses);
            db.SaveChanges();

            DateTime RandomDate(Random random, DateTime start, DateTime end)
            {
                var range = (end - start).Days;
                return start.AddDays(random.Next(range))
                            .AddMinutes(random.Next(0, 1440));
            }

            List<Expense> GenerateRandomExpenses(int count, int userId, DateTime startDate, DateTime endDate)
            {
                var random = new Random();
                var expenses = new List<Expense>();

                for (int i = 0; i < count; i++)
                {
                    int categoryId = random.Next(1, 10); // 1–9
                    var possibleSubcategories = CategorySubcategories[categoryId];
                    int? subCategoryId = possibleSubcategories[random.Next(possibleSubcategories.Count)];

                    var expense = new Expense(
                        title: CategoryTitles[categoryId][random.Next(CategoryTitles[categoryId].Length)],
                        description: CategoryDescriptions[categoryId][random.Next(CategoryDescriptions[categoryId].Length)],
                        cost: Math.Round((decimal)(random.NextDouble() * 300 + 2), 2),
                        categoryId: categoryId,
                        subCategoryId: subCategoryId,
                        expenseDate: RandomDate(random, startDate, endDate),
                        paymentType: (PaymentType)random.Next(0, 3),
                        userId: userId,
                        currency: (Currency)random.Next(0, 2)
                    );

                    expenses.Add(expense);
                }
                return expenses;
            }
        }
    }

    /// <summary>
    /// Utility class for selecting random, non-repeating colors from a predefined list.
    /// </summary>
    public class ColorPicker
    {
        private readonly List<string> _availableColors;
        private readonly Random _random = new();

        public ColorPicker(IEnumerable<string> colors)
        {
            _availableColors = colors.ToList();
        }

        /// <summary>
        /// Retrieves and removes a random color from the available list.
        /// </summary>
        /// <returns>A hex color string.</returns>
        /// <exception cref="InvalidOperationException">Thrown when no colors are left.</exception>
        public string GetNext()
        {
            if (_availableColors.Count == 0)
                throw new InvalidOperationException("No more available colors.");

            int index = _random.Next(_availableColors.Count);
            string color = _availableColors[index];
            _availableColors.RemoveAt(index);

            return color;
        }
    }
}