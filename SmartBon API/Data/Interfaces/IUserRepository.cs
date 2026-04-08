using Data.Models;

namespace Data.Interfaces
{
    /// <summary>
    /// Repository for managing users.
    /// </summary>
    public interface IUserRepository : IRepository<User>
    {
        /// <summary>
        /// Retrieves a user by their email address.
        /// </summary>
        /// <param name="email">The email address of the user.</param>
        /// <returns>The user, or null if not found.</returns>
        User? GetByEmail(string email);

        /// <summary>
        /// Calculates the total sum of all expenses made by a specific user.
        /// </summary>
        /// <param name="id">The identifier of the user.</param>
        /// <returns>The total sum of expenses.</returns>
        decimal GetUserTotalExpenses(int id);

        /// <summary>
        /// Retrieves a user based on a provided refresh token.
        /// </summary>
        /// <param name="refreshToken">The refresh token string.</param>
        /// <returns>The user, or null if the token is invalid or not found.</returns>
        Task<User?> GetByRefreshToken(string refreshToken);
    }
}