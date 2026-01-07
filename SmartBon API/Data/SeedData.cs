using Data.Models;
using Microsoft.AspNetCore.Identity;
using Shared.Enums;

namespace Data
{
    public static class SeedData
    {
        private static AppDbContext db;
        public static void SeedAll(AppDbContext dbContext)
        {
            db = dbContext;

            if (!db.Users.Any())
            {
                SeedUsers();
            }
            if (!db.Categories.Any())
            {
                SeedCategories();
            }
            if (!db.Subcategories.Any())
            {
                SeedSubcategories();
            }
            if (!db.Expenses.Any())
            {
                SeedExpenses();
            }
        }


        private static void SeedUsers()
        {
            var hasher = new PasswordHasher<User>();
            List<User> users = new()
            {
                new User("m.kostadinov07@gmail.com", hasher.HashPassword(null!, "192837465Aqs")),
                new User("temp@example.com", hasher.HashPassword(null!, "123456789"))
            };
            db.Users.AddRange(users);
            db.SaveChanges();

        }

        private static void SeedCategories()
        {
            List<Category> categories = new()
            {
                new Category("Food", "🍔", true, null),
                new Category("Drinks", "🍺", true, null),
                new Category("Groceries", "🛒", true, null),
                new Category("Shopping", "🛍", true, null),
                new Category("Transport", "🚗", true, null),
                new Category("Bills", "💵", true, null),
                new Category("Travel", "🧳", true, null),
                new Category("Beauty", "🌸", true, null),
                new Category("Gifts", "🎁", true, null),
            };
            db.Categories.AddRange(categories);
            db.SaveChanges();

        }

        private static void SeedSubcategories()
        {
            List<Subcategory> subcategories = new()
            {
                new Subcategory("Restaurants", "🍽️", 1, 1),
                new Subcategory("Fast Food", "🍔", 1, 1),
                new Subcategory("Alcohol", "🍺", 1, 2),
                new Subcategory("Soft Drinks", "🥤", 1, 2),
                new Subcategory("Coffee & Tea", "☕", 1, 2),
                new Subcategory("Fuel", "⛽", 1, 5),
                new Subcategory("Taxi", "🚕", 1, 5),
                new Subcategory("Public Transport", "🚌", 1, 5)
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
                // Food
                { 1, new[]
                    {
                        "Lunch", "Dinner", "Breakfast", "Brunch",
                        "Takeaway food", "Pizza order", "Burger combo",
                        "Sushi order", "Snack"
                    }
                },

                // Drinks
                { 2, new[]
                    {
                        "Coffee", "Morning coffee", "Iced coffee",
                        "Tea", "Soft drink", "Beer", "Wine",
                        "Cocktail", "Drinks with friends"
                    }
                },

                // Groceries
                { 3, new[]
                    {
                        "Weekly groceries", "Supermarket shopping",
                        "Organic food", "Market groceries"
                    }
                },

                // Shopping
                { 4, new[]
                    {
                        "Online shopping", "Clothes shopping",
                        "Shoes purchase", "Electronics", "Accessories"
                    }
                },

                // Transport
                { 5, new[]
                    {
                        "Taxi ride", "Gas refill", "Fuel",
                        "Parking fee", "Public transport",
                        "Bus ticket", "Metro ticket"
                    }
                },

                // Bills
                { 6, new[]
                    {
                        "Electricity bill", "Water bill",
                        "Internet bill", "Phone bill",
                        "Subscription payment"
                    }
                },

                // Travel
                { 7, new[]
                    {
                        "Hotel booking", "Flight ticket",
                        "Train ticket", "Car rental",
                        "Travel expenses"
                    }
                },

                // Beauty
                { 8, new[]
                    {
                        "Haircut", "Barber visit",
                        "Hair styling", "Cosmetics",
                        "Skincare products"
                    }
                },

                // Gifts
                { 9, new[]
                    {
                        "Birthday gift", "Anniversary gift",
                        "Holiday gift", "Surprise gift"
                    }
                }
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
                    int? subCategoryId = possibleSubcategories[
                        random.Next(possibleSubcategories.Count)
                    ];

                    var expense = new Expense(
                        title: CategoryTitles[categoryId][random.Next(CategoryTitles[categoryId].Length)],
                        description: CategoryDescriptions[categoryId][random.Next(CategoryDescriptions[categoryId].Length)],
                        cost: Math.Round((decimal)(random.NextDouble() * 300 + 2), 2),
                        categoryId: categoryId,
                        subCategoryId: subCategoryId,
                        expenseDate: RandomDate(random, startDate, endDate),
                        paymentType: (PaymentType)random.Next(0, 3),
                        userId: userId
                    );

                    expenses.Add(expense);
                }

                return expenses;
            }
        }
    }
}

