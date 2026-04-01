using Data.Models;
namespace Data.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        User? GetByEmail(string email);
        decimal GetUserTotalExpenses(int id);

        Task<User?> GetByRefreshToken(string refreshToken);
    }
}
