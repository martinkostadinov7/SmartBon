using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

            optionsBuilder.UseSqlServer("Data Source=DESKTOP-U242LRB\\SQLEXPRESS;Initial Catalog=SmartBonDb;Integrated Security=True;Encrypt=True;Trust Server Certificate=True;");

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
