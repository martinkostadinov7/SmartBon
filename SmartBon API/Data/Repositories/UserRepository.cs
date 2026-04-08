using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Data.Repositories
{
    /// <inheritdoc />
    public class UserRepository(AppDbContext context) : EFRepository<User>(context), IUserRepository
    {
        /// <inheritdoc />
        public User? GetByEmail(string email)
        {
            return _dbSet.SingleOrDefault(x => x.Email == email);
        }

        /// <inheritdoc />
        public async Task<User?> GetByRefreshToken(string refreshToken)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        }

        /// <inheritdoc />
        public decimal GetUserTotalExpenses(int id)
        {
            decimal total = _context.Expenses.Where(e => e.UserId == id).Sum(e => e.Cost);
            return total;
        }
    }
}
