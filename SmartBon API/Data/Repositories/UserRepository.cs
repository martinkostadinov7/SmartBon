using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Data.Repositories
{
    public class UserRepository(AppDbContext context) : EFRepository<User>(context), IUserRepository
    {
        public User? GetByEmail(string email)
        {
            return _dbSet.SingleOrDefault(x => x.Email == email);
        }

        public async Task<User?> GetByRefreshToken(string refreshToken)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        }

        public decimal GetUserTotalExpenses(int id)
        {
            decimal total = _context.Expenses.Where(e => e.UserId == id).Sum(e => e.Cost);
            return total;
        }


    }
}
