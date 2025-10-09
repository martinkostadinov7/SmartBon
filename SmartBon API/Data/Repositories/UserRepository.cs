using Data.Interfaces;
using Data.Models;

namespace Data.Repositories
{
    public class UserRepository(AppDbContext context) : EFRepository<User>(context), IUserRepository
    {
        public User? GetByEmail(string email)
        {
            return _dbSet.SingleOrDefault(x => x.Email == email);
        }
    }
}
