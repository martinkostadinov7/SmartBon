using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace Data
{
    /// <summary>
    /// Factory for creating <see cref="AppDbContext"/> instances during design time, 
    /// primarily used by Entity Framework Core tools for generating migrations.
    /// </summary>
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

            // Note: Consider moving the connection string to a secure configuration file (e.g., appsettings.json) for production.
            optionsBuilder.UseSqlServer("Data Source=DESKTOP-U242LRB\\SQLEXPRESS;Initial Catalog=SmartBonDb;Integrated Security=True;Encrypt=True;Trust Server Certificate=True;");

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
