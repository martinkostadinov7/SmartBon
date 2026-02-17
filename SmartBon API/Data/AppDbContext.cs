using Data.Models;
using Microsoft.EntityFrameworkCore;
namespace Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }

        public DbSet<Expense> Expenses { get; set; }

        public DbSet<Category> Categories { get; set; }

        public DbSet<Subcategory> Subcategories { get; set; }

        public DbSet<Budget> Budgets { get; set; }

        public DbSet<Goal> Goals { get; set; }

        public DbSet<GoalContribution> GoalContributions { get; set; }

        public AppDbContext() { }
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }

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

        }
    }
}
