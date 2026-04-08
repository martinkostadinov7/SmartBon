using Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Data
{
    /// <summary>
    /// Represents the primary database context for the application, managing entity configurations and data access.
    /// </summary>
    public class AppDbContext : DbContext
    {
        /// <summary> Gets or sets the collection of users in the database. </summary>
        public DbSet<User> Users { get; set; }

        /// <summary> Gets or sets the collection of all logged expenses. </summary>
        public DbSet<Expense> Expenses { get; set; }

        /// <summary> Gets or sets the collection of templates for recurring expenses. </summary>
        public DbSet<RecurringExpense> RecurringExpenses { get; set; }

        /// <summary> Gets or sets the main categories available for expenses. </summary>
        public DbSet<Category> Categories { get; set; }

        /// <summary> Gets or sets the subcategories linked to main categories. </summary>
        public DbSet<Subcategory> Subcategories { get; set; }

        /// <summary> Gets or sets the budget limits set by users. </summary>
        public DbSet<Budget> Budgets { get; set; }

        /// <summary> Gets or sets the financial saving goals set by users. </summary>
        public DbSet<Goal> Goals { get; set; }

        /// <summary> Gets or sets the individual contributions made towards financial goals. </summary>
        public DbSet<GoalContribution> GoalContributions { get; set; }

        public AppDbContext() { }
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }

        /// <summary>
        /// Configures the database schema, relationships, and enum conversions.
        /// </summary>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .Property(e => e.DefaultCurrency)
                .HasConversion<string>();

            modelBuilder.Entity<Expense>()
                .Property(e => e.PaymentType)
                .HasConversion<string>();

            modelBuilder.Entity<Expense>()
                .HasOne(e => e.Subcategory)
                .WithMany()
                .HasForeignKey(e => e.SubcategoryId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Expense>()
                .HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Subcategory>()
                .HasOne(s => s.Category)
                .WithMany(c => c.Subcategories)
                .HasForeignKey(s => s.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Expense>()
                .HasOne(e => e.RecurringExpense)
                .WithMany(re => re.Expenses)
                .HasForeignKey(e => e.RecurringExpenseId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}